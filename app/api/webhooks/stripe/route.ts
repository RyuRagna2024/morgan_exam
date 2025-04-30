// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import prisma from "@/lib/prisma"; // Adjust path to your prisma client
import { stripe } from "@/lib/stripe"; // Adjust path to your stripe client instance
import { Tier, OrderStatus, Prisma } from "@prisma/client"; // Import Prisma types

// --- Tier Discount Logic (Must match logic used in checkout actions) ---
const TIER_DISCOUNTS: Record<Tier, number> = {
  [Tier.BRONZE]: 0,
  [Tier.SILVER]: 0.05,
  [Tier.GOLD]: 0.1,
  [Tier.PLATINUM]: 0.15,
};
function calculateDiscountedPrice(price: number, tier: Tier): number {
  const discountPercentage = TIER_DISCOUNTS[tier] || 0;
  if (typeof price !== "number" || isNaN(price))
    return typeof price === "number" ? price : 0;
  return parseFloat((Number(price) * (1 - discountPercentage)).toFixed(2));
}
// --- End Tier Discount Logic ---

export async function POST(req: NextRequest) {
  let body: string;
  try {
    body = await req.text(); // Read the raw body
  } catch (error) {
    console.error("[Webhook] Error reading request body:", error);
    return new NextResponse("Webhook Error: Could not read body", {
      status: 400,
    });
  }

  const signature = headers().get("Stripe-Signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; // Get secret from environment variables

  if (!signature) {
    console.error("[Webhook] Error: Missing Stripe-Signature header.");
    return new NextResponse("Webhook Error: Missing signature", {
      status: 400,
    });
  }
  if (!webhookSecret) {
    console.error("[Webhook] Error: Stripe webhook secret is not configured.");
    return new NextResponse("Webhook Error: Missing secret configuration", {
      status: 500,
    });
  }

  let event: Stripe.Event;

  // Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(
      `[Webhook] Received and verified event: ${event.type} (ID: ${event.id})`,
    );
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // --- Handle the payment_intent.succeeded event ---
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(
      `[Webhook] Processing successful PaymentIntent: ${paymentIntent.id}`,
    );

    // --- Idempotency: Check if order already exists for this PaymentIntent ---
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { paymentIntentId: paymentIntent.id },
        select: { id: true },
      });

      if (existingOrder) {
        console.log(
          `[Webhook] Order ${existingOrder.id} already processed for PI ${paymentIntent.id}. Skipping.`,
        );
        return NextResponse.json({
          received: true,
          message: "Order already processed.",
        });
      }
    } catch (dbError) {
      console.error(
        `[Webhook] DB error checking for existing order (PI: ${paymentIntent.id}):`,
        dbError,
      );
      return new NextResponse(
        "Webhook database error during idempotency check",
        { status: 500 },
      );
    }

    // --- Extract metadata (ensure keys match what you sent in prepareCheckoutSession) ---
    const metadata = paymentIntent.metadata;
    const userId = metadata?.userId;
    const cartId = metadata?.cartId;
    const userTier = metadata?.tier as Tier | undefined; // Cast and handle potential undefined
    const userEmail = metadata?.userEmail; // Get email from metadata

    // --- Validate essential metadata ---
    if (!userId || !cartId || !userTier || !userEmail) {
      console.error(
        `[Webhook] Critical metadata missing for PI ${paymentIntent.id}. Cannot create order.`,
      );
      // Consider sending an alert or logging for manual intervention
      return new NextResponse("Webhook Error: Missing required metadata", {
        status: 400,
      });
    }

    // --- Process the successful payment ---
    try {
      // 1. Fetch Cart Items associated with this checkout session
      const cartItems = await prisma.cartItem.findMany({
        where: { cartId: cartId, cart: { userId: userId } }, // Ensure cart belongs to user
        include: { variation: true },
      });

      if (cartItems.length === 0) {
        console.warn(
          `[Webhook] Cart ${cartId} (User: ${userId}, PI: ${paymentIntent.id}) was empty or items not found. Cannot create order.`,
        );
        // This could happen if something cleared the cart prematurely. Log for investigation.
        return new NextResponse(
          "Webhook Error: Cart items not found for order creation",
          { status: 400 },
        );
      }

      // 2. Re-calculate Total Amount Server-Side (Trust this over client/metadata amount)
      let calculatedTotal = 0;
      const orderItemsCreateData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const item of cartItems) {
        if (!item.variation || typeof item.variation.price !== "number") {
          console.error(
            `Webhook Error: Invalid price for variation ${item.variationId} in cart ${cartId}`,
          );
          throw new Error(
            `Invalid price data for variation ${item.variationId}`,
          );
        }
        const discountedPrice = calculateDiscountedPrice(
          item.variation.price,
          userTier,
        );
        calculatedTotal += discountedPrice * item.quantity;
        orderItemsCreateData.push({
          variationId: item.variationId,
          quantity: item.quantity,
          price: discountedPrice, // Store the final price paid per item
        });
      }
      const finalTotalAmount = parseFloat(calculatedTotal.toFixed(2));

      // Optional sanity check against payment intent amount (in cents)
      if (paymentIntent.amount !== Math.round(finalTotalAmount * 100)) {
        console.warn(
          `[Webhook] Amount mismatch for PI ${paymentIntent.id}! Stripe amount: ${paymentIntent.amount}, Server calculated cents: ${Math.round(finalTotalAmount * 100)}. Using server calculated amount.`,
        );
        // Log this discrepancy for review. Proceeding with server calculation is usually safer.
      }

      // 3. Create Order and OrderItems within a Database Transaction
      console.log(
        `[Webhook] Creating database records for order (PI: ${paymentIntent.id})...`,
      );
      const newOrder = await prisma.$transaction(async (tx) => {
        // Create the Order
        const order = await tx.order.create({
          data: {
            // Core Info
            userId: userId,
            paymentIntentId: paymentIntent.id, // Link to Stripe PI
            status: OrderStatus.PROCESSING, // Initial status after payment success
            totalAmount: finalTotalAmount,

            // Details from Metadata (provide fallbacks or handle missing data)
            firstName: metadata.firstName || "Unknown",
            lastName: metadata.lastName || "User",
            companyName: metadata.companyName || "", // Ensure required fields have values
            countryRegion: metadata.countryRegion || "Unknown",
            streetAddress: metadata.streetAddress || "Unknown",
            apartmentSuite: metadata.apartmentSuite || null,
            townCity: metadata.townCity || "Unknown",
            province: metadata.province || "Unknown",
            postcode: metadata.postcode || "Unknown",
            phone: metadata.phone || "Unknown",
            email: userEmail, // Use email from metadata
            captivityBranch: metadata.captivityBranch || "Default",
            methodOfCollection: metadata.methodOfCollection || "Default",
            salesRep: metadata.salesRep || null,
            referenceNumber: metadata.referenceNumber || null,
            orderNotes: metadata.orderNotes || null,
            agreeTerms: metadata.agreeTerms === "true",
            receiveEmailReviews: metadata.receiveEmailReviews === "true",

            // Create Order Items simultaneously
            orderItems: {
              createMany: {
                data: orderItemsCreateData,
                skipDuplicates: false, // Should not happen if cart logic is correct
              },
            },
          },
          include: { orderItems: true }, // Include items for confirmation/logging
        });

        console.log(
          `[Webhook] Order ${order.id} created in DB. Clearing cart ${cartId}...`,
        );

        // Clear the User's Cart items that were part of this order
        await tx.cartItem.deleteMany({
          where: { cartId: cartId },
        });
        // Optionally, delete the Cart itself if it's now empty
        // await tx.cart.delete({ where: { id: cartId } });

        console.log(`[Webhook] Cart ${cartId} cleared.`);
        return order; // Return the created order from the transaction
      });

      // --- Post-Transaction Actions ---
      try {
        // TODO: Send order confirmation email to userEmail
        console.log(
          `[Webhook] PLACEHOLDER: Send confirmation email for order ${newOrder.id} to ${userEmail}`,
        );
        // Example: await sendOrderConfirmationEmail(userEmail, newOrder);

        // TODO: Notify internal team? Update inventory?
        console.log(
          `[Webhook] PLACEHOLDER: Trigger inventory update for order ${newOrder.id}`,
        );
      } catch (postOrderError) {
        // Log errors but don't fail the webhook response, order is already created
        console.error(
          `[Webhook] Error during post-order actions for order ${newOrder.id}:`,
          postOrderError,
        );
      }

      console.log(
        `[Webhook] Successfully processed PI ${paymentIntent.id}. Order created: ${newOrder.id}`,
      );
    } catch (error: any) {
      console.error(
        `[Webhook] Error processing successful PaymentIntent ${paymentIntent.id}:`,
        error,
      );
      // Respond with error but Stripe won't retry 5xx errors often
      return new NextResponse(`Webhook processing error: ${error.message}`, {
        status: 500,
      });
    }
  }
  // --- Handle other event types if needed ---
  // else if (event.type === 'payment_intent.payment_failed') { ... }
  // else if (event.type === 'charge.succeeded') { ... } // Less common now with PaymentIntents
  else {
    console.log(`[Webhook] Received unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event to Stripe
  return NextResponse.json({ received: true });
}

// app/(public)/checkout/checkout-order.ts
"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Tier, OrderStatus } from "@prisma/client"; // Import Tier enum
// Removed validation/type imports for OrderInput as formData is no longer the primary input here
import { z } from "zod";

// --- Restore TIER_DISCOUNTS definition ---
const TIER_DISCOUNTS: Record<Tier, number> = {
  [Tier.BRONZE]: 0,
  [Tier.SILVER]: 0.05,
  [Tier.GOLD]: 0.1,
  [Tier.PLATINUM]: 0.15,
};
// --- End Restoration ---

// Calculate discounted price function
function calculateDiscountedPrice(price: number, tier: Tier): number {
  const discountPercentage = TIER_DISCOUNTS[tier] || 0;
  if (typeof price !== "number" || isNaN(price)) {
    console.error(`[calculateDiscountedPrice] Invalid price: ${price}`);
    return price;
  }
  return parseFloat((price * (1 - discountPercentage)).toFixed(2));
}

// Define the expected return type
interface CreatePaymentIntentResult {
  success: boolean;
  error?: string;
  clientSecret?: string | null;
  // Removed orderId as we aren't creating the preliminary order here anymore
}

// Renamed Function
export async function createPaymentIntentAction(): Promise<CreatePaymentIntentResult> {
  console.log("[Server Action] createPaymentIntentAction called");
  try {
    // 1. Validate User & Get Tier
    const { user } = await validateRequest();
    if (!user || (user.role !== "CUSTOMER" && user.role !== "PROCUSTOMER")) {
      return {
        success: false,
        error: "User not authenticated or not a customer.",
      };
    }
    const userTier = user.tier;
    console.log(
      "[createPaymentIntentAction] User authenticated:",
      user.id,
      "Tier:",
      userTier,
    );

    // 2. Validate Input Data - REMOVED ZOD VALIDATION OF formData

    // 3. Get Cart and Items
    const userCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { cartItems: { include: { variation: true } } },
    });

    if (!userCart || !userCart.cartItems || userCart.cartItems.length === 0) {
      return {
        success: false,
        error: "Cannot create payment intent: Cart is empty.",
      };
    }
    console.log(
      `[createPaymentIntentAction] Cart has ${userCart.cartItems.length} item types.`,
    );

    // 4. Calculate Final Discounted Order Amount (in cents)
    let orderTotalAmount = 0;
    for (const item of userCart.cartItems) {
      if (!item.variation || typeof item.variation.price !== "number") {
        throw new Error(`Invalid price for item variation ${item.variationId}`);
      }
      const discountedPrice = calculateDiscountedPrice(
        item.variation.price,
        userTier,
      );
      orderTotalAmount += discountedPrice * item.quantity;
    }
    orderTotalAmount = parseFloat(orderTotalAmount.toFixed(2));
    const amountInCents = Math.round(orderTotalAmount * 100);

    if (amountInCents <= 0) {
      return { success: false, error: "Amount must be positive." };
    }
    console.log(
      `[createPaymentIntentAction] Calculated total: ${orderTotalAmount.toFixed(2)} (${amountInCents} cents)`,
    );

    // 5. Create Preliminary Order - REMOVED

    // 6. Create Stripe PaymentIntent
    console.log("[createPaymentIntentAction] Creating Stripe PaymentIntent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd", // TODO: Change currency
      automatic_payment_methods: { enabled: true },
      metadata: {
        // Only include data known at this point
        userId: user.id,
        // Cannot add orderId as it's not created yet
      },
    });
    console.log(
      `[createPaymentIntentAction] PaymentIntent created: ${paymentIntent.id}`,
    );

    // 7. Return Client Secret
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("[createPaymentIntentAction] Error:", error);
    let errorMessage = "Could not initialize checkout.";
    return { success: false, error: errorMessage };
  }
}

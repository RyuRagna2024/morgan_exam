// app/(public)/checkout/checkout-actions.ts
"use server";

import { z } from "zod";
import { validateRequest } from "@/auth"; // Adjust path as needed
import prisma from "@/lib/prisma"; // Adjust path as needed
import { stripe } from "@/lib/stripe"; // Adjust path as needed
import { Tier, OrderStatus, Prisma, User } from "@prisma/client"; // Import necessary Prisma types

// Adjust import paths for these if they are in different locations
import { orderValidationSchema } from "./order-validations";
import type {
  OrderInput,
  PrepareSessionResult,
  GetOrderDetailsResponse,
  OrderStatusResult,
  OrderWithRelations,
} from "./order-types";

// --- Tier Discount Logic ---
// IMPORTANT: Ensure this matches any other place you calculate discounts!
const TIER_DISCOUNTS: Record<Tier, number> = {
  [Tier.BRONZE]: 0,
  [Tier.SILVER]: 0.05,
  [Tier.GOLD]: 0.1,
  [Tier.PLATINUM]: 0.15,
};

function calculateDiscountedPrice(price: number, tier: Tier): number {
  const discountPercentage = TIER_DISCOUNTS[tier] || 0;
  if (typeof price !== "number" || isNaN(price)) {
    console.error(`[calculateDiscountedPrice] Invalid price input: ${price}`);
    return typeof price === "number" ? price : 0;
  }
  return parseFloat((Number(price) * (1 - discountPercentage)).toFixed(2));
}
// --- End Tier Discount Logic ---

// === Action 1: Prepare Checkout Session ===
// Validates details, calculates amount, creates Stripe PaymentIntent with metadata
export async function prepareCheckoutSession(
  details: OrderInput,
): Promise<PrepareSessionResult> {
  console.log("[Action] prepareCheckoutSession: Initiated.");
  try {
    // 1. Validate User & Get Tier
    const { user } = await validateRequest();
    if (!user || (user.role !== "CUSTOMER" && user.role !== "PROCUSTOMER")) {
      console.warn("[Action] prepareCheckoutSession: Authentication failed.");
      return {
        success: false,
        error: "User not authenticated or not a customer.",
      };
    }
    const userTier = user.tier;
    console.log(
      `[Action] prepareCheckoutSession: User ${user.id}, Tier ${userTier}`,
    );

    // 2. Validate Input Details (Server-side check)
    const validationResult = orderValidationSchema.safeParse(details);
    if (!validationResult.success) {
      console.warn(
        "[Action] prepareCheckoutSession: Validation failed:",
        validationResult.error.flatten(),
      );
      const errors = validationResult.error.flatten().fieldErrors;
      const errorMsg = Object.entries(errors)
        .map(([key, value]) => `${key}: ${value?.join(", ")}`)
        .join("; ");
      return {
        success: false,
        error: `Invalid checkout details: ${errorMsg || "Please check the form."}`,
      };
    }
    const validatedDetails = validationResult.data;
    console.log("[Action] prepareCheckoutSession: Details validated.");

    // 3. Get Cart and Calculate Amount
    const userCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { cartItems: { include: { variation: true } } },
    });
    if (!userCart || !userCart.cartItems || userCart.cartItems.length === 0) {
      console.warn(
        `[Action] prepareCheckoutSession: Cart empty for user ${user.id}.`,
      );
      return { success: false, error: "Cannot proceed: Cart is empty." };
    }

    let orderTotalAmount = 0;
    for (const item of userCart.cartItems) {
      if (!item.variation || typeof item.variation.price !== "number") {
        console.error(
          `[Action] prepareCheckoutSession: Invalid price for variation ${item.variationId}.`,
        );
        throw new Error(
          `Invalid price configuration for item variation ${item.variationId}`,
        );
      }
      const discountedPrice = calculateDiscountedPrice(
        item.variation.price,
        userTier,
      );
      orderTotalAmount += discountedPrice * item.quantity;
    }
    const finalTotal = parseFloat(orderTotalAmount.toFixed(2));
    const amountInCents = Math.round(finalTotal * 100);

    if (amountInCents <= 0) {
      console.warn(
        `[Action] prepareCheckoutSession: Calculated amount zero or negative (${amountInCents}).`,
      );
      return { success: false, error: "Order amount must be positive." };
    }
    const currencyCode = "usd"; // <<< CHANGE TO 'zar' or your currency
    console.log(
      `[Action] prepareCheckoutSession: Calculated total ${amountInCents} ${currencyCode.toUpperCase()} cents`,
    );

    // 4. Prepare Metadata for Stripe
    const metadataForStripe: Record<string, string> = {
      userId: user.id,
      userEmail: validatedDetails.email,
      tier: userTier,
      cartId: userCart.id,
      firstName: validatedDetails.firstName,
      lastName: validatedDetails.lastName,
      companyName: validatedDetails.companyName,
      countryRegion: validatedDetails.countryRegion,
      streetAddress: validatedDetails.streetAddress,
      apartmentSuite: validatedDetails.apartmentSuite ?? "",
      townCity: validatedDetails.townCity,
      province: validatedDetails.province,
      postcode: validatedDetails.postcode,
      phone: validatedDetails.phone,
      captivityBranch: validatedDetails.captivityBranch,
      methodOfCollection: validatedDetails.methodOfCollection,
      salesRep: validatedDetails.salesRep ?? "",
      referenceNumber: validatedDetails.referenceNumber ?? "",
      orderNotes: validatedDetails.orderNotes
        ? validatedDetails.orderNotes.substring(0, 490)
        : "",
      agreeTerms: String(validatedDetails.agreeTerms),
      receiveEmailReviews: String(
        validatedDetails.receiveEmailReviews ?? false,
      ),
      calculatedTotalCents: String(amountInCents),
      currency: currencyCode,
    };
    Object.entries(metadataForStripe).forEach(([key, value]) => {
      if (value.length > 500)
        console.warn(`[Action] Metadata key '${key}' exceeds 500 chars!`);
    });

    // 5. Create Stripe PaymentIntent
    console.log(
      "[Action] prepareCheckoutSession: Creating Stripe PaymentIntent...",
    );
    const countryCode =
      validatedDetails.countryRegion.length === 2
        ? validatedDetails.countryRegion.toUpperCase()
        : "ZA"; // Default needed? Ensure valid 2-letter code
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currencyCode,
      automatic_payment_methods: { enabled: true },
      metadata: metadataForStripe,
      description: `Order from ${validatedDetails.email} (${user.id})`,
      shipping: {
        name: `${validatedDetails.firstName} ${validatedDetails.lastName}`,
        phone: validatedDetails.phone,
        address: {
          line1: validatedDetails.streetAddress,
          line2: validatedDetails.apartmentSuite ?? undefined,
          city: validatedDetails.townCity,
          state: validatedDetails.province,
          postal_code: validatedDetails.postcode,
          country: countryCode,
        },
      },
    });
    console.log(
      `[Action] prepareCheckoutSession: PaymentIntent created: ${paymentIntent.id}`,
    );

    // 6. Return Client Secret
    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("[Action] prepareCheckoutSession: Critical Error:", error);
    return {
      success: false,
      error: "Could not initialize payment session due to a server error.",
    };
  }
}

// === Action 2: Get Order Details ===
// Fetches full order details for the confirmation page
export async function getOrderDetails(
  orderId: string,
): Promise<GetOrderDetailsResponse> {
  console.log(`[Action] getOrderDetails: Fetching order ${orderId}`);
  if (!orderId) return { success: false, message: "Order ID is required." };

  try {
    const { user } = await validateRequest();
    if (!user) return { success: false, message: "User not authenticated." };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { variation: { include: { product: true } } } },
        // user: true, // Include user if needed
      },
    });

    if (!order) {
      console.warn(`[Action] getOrderDetails: Order ${orderId} not found.`);
      return { success: false, message: "Order not found.", order: null };
    }

    if (order.userId !== user.id /* && user.role !== 'ADMIN' */) {
      // Check authorization
      console.warn(
        `[Action] getOrderDetails: Unauthorized attempt user ${user.id} on order ${orderId}.`,
      );
      return { success: false, message: "Permission denied.", order: null };
    }

    console.log(`[Action] getOrderDetails: Order ${orderId} found.`);
    return { success: true, order: order as OrderWithRelations }; // Cast is safe due to include
  } catch (error) {
    console.error(
      `[Action] getOrderDetails: Error fetching order ${orderId}:`,
      error,
    );
    return { success: false, message: "Server error fetching order details." };
  }
}

// === Action 3: Get Order Status By Payment Intent ===
// Used by the /order/processing page to poll for order creation status
export async function getOrderStatusByPaymentIntent(
  paymentIntentId: string,
): Promise<OrderStatusResult> {
  console.log(
    `[Action] getOrderStatusByPaymentIntent: Checking PI ${paymentIntentId}`,
  );
  if (!paymentIntentId) {
    return {
      success: false,
      status: "failed",
      error: "Payment Intent ID missing.",
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { paymentIntentId: paymentIntentId },
      select: { id: true, status: true }, // Fetch only needed fields
    });

    if (order) {
      console.log(
        `[Action] getOrderStatus: Found Order ${order.id} for PI ${paymentIntentId}, Status: ${order.status}`,
      );
      // Use statuses defined in your OrderStatus enum
      const completedStatuses: OrderStatus[] = [
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ];
      const failedStatuses: OrderStatus[] = [
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED,
      ]; // Add FAILED if defined

      if (completedStatuses.includes(order.status)) {
        return { success: true, status: "completed", orderId: order.id };
      } else if (failedStatuses.includes(order.status)) {
        return {
          success: true,
          status: "failed",
          orderId: order.id,
          error: `Order status: ${order.status}.`,
        };
      } else {
        // PENDING, PROCESSING
        return { success: true, status: "processing", orderId: order.id };
      }
    } else {
      // Order not found yet, webhook likely delayed
      console.log(
        `[Action] getOrderStatus: Order not yet found for PI ${paymentIntentId}. Assume processing.`,
      );
      return { success: true, status: "processing", orderId: null };
    }
  } catch (error) {
    console.error(
      `[Action] getOrderStatus: Error checking status for PI ${paymentIntentId}:`,
      error,
    );
    return {
      success: false,
      status: "failed",
      error: "Server error checking order status.",
    };
  }
}

// === Action 4: Get Basic User Info for Checkout Pre-fill ===
// Used by the checkout page (Step 1) to get fallback data
interface BasicUserInfo {
  // Define structure for returned user data
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  country: string | null;
  streetAddress: string | null;
  suburb: string | null;
  townCity: string | null;
  postcode: string | null;
}
interface GetBasicUserInfoResult {
  success: boolean;
  user: BasicUserInfo | null;
  error?: string;
}

export async function getBasicUserInfoForCheckout(): Promise<GetBasicUserInfoResult> {
  console.log("[Action] getBasicUserInfoForCheckout: Fetching...");
  try {
    const { user } = await validateRequest(); // Authenticate
    if (!user) {
      console.warn("[Action] getBasicUserInfoForCheckout: Not authenticated.");
      return { success: false, user: null, error: "User not authenticated." };
    }

    // Select only necessary fields from the full User model
    const basicInfo: BasicUserInfo = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber ?? null,
      country: user.country ?? null,
      streetAddress: user.streetAddress ?? null,
      suburb: user.suburb ?? null,
      townCity: user.townCity ?? null,
      postcode: user.postcode ?? null,
    };
    console.log(
      `[Action] getBasicUserInfoForCheckout: User ${user.id} info retrieved.`,
    );
    return { success: true, user: basicInfo };
  } catch (error) {
    console.error("[Action] getBasicUserInfoForCheckout: Error:", error);
    return {
      success: false,
      user: null,
      error: "Failed to retrieve user information.",
    };
  }
}

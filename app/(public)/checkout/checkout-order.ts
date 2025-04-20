"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth"; // Assuming auth setup is correct
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { orderValidationSchema } from "./order-validations";
import {
  OrderInput,
  PlaceOrderResponse,
  GetOrderDetailsResponse,
} from "./order-types";
// **********************************************************
// ** REMOVE THIS IMPORT - It's causing the client/server boundary error **
// import { TIER_DISCOUNTS } from "../(group-products)/_components/(filterside)/tier-util";
// **********************************************************

// **********************************************************
// ** DEFINE TIER_DISCOUNTS DIRECTLY HERE (SERVER-SIDE) **
// Make sure these values match what you use on the client-side
const TIER_DISCOUNTS = {
  BRONZE: 0,
  SILVER: 0.05, // Example: 5% discount
  GOLD: 0.1, // Example: 10% discount
  PLATINUM: 0.15, // Example: 15% discount
  // Add any other tiers you have with their discount percentages (0 to 1)
};
// **********************************************************

// Calculate the discounted price based on user tier
function calculateDiscountedPrice(price: number, tier: string): number {
  // Now uses the locally defined TIER_DISCOUNTS
  const discountPercentage =
    TIER_DISCOUNTS[tier as keyof typeof TIER_DISCOUNTS] || 0; // Use 'as keyof typeof' for type safety
  // Add safety check for price type
  if (typeof price !== "number" || isNaN(price)) {
    console.error(
      `[calculateDiscountedPrice] Invalid price received: ${price}`,
    );
    return 0; // Or handle as appropriate, maybe return original price?
  }
  return price * (1 - discountPercentage);
}

/**
 * Server action to place an order with items from the user's cart
 */
export async function placeOrder(
  formData: OrderInput,
): Promise<PlaceOrderResponse> {
  console.log("[Server Action] placeOrder called with formData:", formData);
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session || user.role !== "CUSTOMER") {
      console.error("[placeOrder] Authentication failed or invalid role:", {
        userId: user?.id,
        userRole: user?.role,
      });
      return {
        success: false,
        message: "You must be logged in as a customer to place an order",
      };
    }
    console.log("[placeOrder] User authenticated:", user.id);

    // Validate input data
    const validatedData = orderValidationSchema.parse(formData);
    console.log("[placeOrder] Form data validated successfully.");

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        cartItems: {
          include: {
            variation: true, // Ensure variation includes price and quantity
          },
        },
      },
    });

    // Check if cart exists and has items
    if (!cart || cart.cartItems.length === 0) {
      console.warn("[placeOrder] Cart is empty for user:", user.id);
      return {
        success: false,
        message: "Your cart is empty",
      };
    }
    console.log(
      `[placeOrder] Found cart ${cart.id} with ${cart.cartItems.length} item types for user ${user.id}.`,
    );

    // Get user's tier for discount calculation
    const userWithTier = await prisma.user.findUnique({
      where: { id: user.id },
      select: { tier: true },
    });

    // Ensure userTier is a valid key or default
    const userTier =
      userWithTier?.tier && TIER_DISCOUNTS.hasOwnProperty(userWithTier.tier)
        ? userWithTier.tier
        : "BRONZE"; // Default to BRONZE if tier is null/invalid
    console.log(`[placeOrder] User tier determined as: ${userTier}`);

    // Calculate total order amount with tier discount applied
    let originalTotalAmount = 0;
    let totalAmount = 0; // This will be the discounted amount

    for (const item of cart.cartItems) {
      if (
        !item.variation ||
        typeof item.variation.price !== "number" ||
        typeof item.quantity !== "number"
      ) {
        console.error(
          `[placeOrder] Invalid cart item data found: VariationId=${item.variationId}, Price=${item.variation?.price}, Quantity=${item.quantity}`,
        );
        throw new Error(
          `Invalid data for item with variation ID ${item.variationId}. Cannot calculate total.`,
        );
      }
      const itemOriginalTotal = item.variation.price * item.quantity;
      const itemDiscountedPrice = calculateDiscountedPrice(
        item.variation.price,
        userTier,
      );
      const itemDiscountedTotal = itemDiscountedPrice * item.quantity;

      originalTotalAmount += itemOriginalTotal;
      totalAmount += itemDiscountedTotal;
    }

    const discountAmount = originalTotalAmount - totalAmount;
    console.log(
      `[placeOrder] Calculated totals: Original=R${originalTotalAmount.toFixed(2)}, Discounted=R${totalAmount.toFixed(2)}, Discount=R${discountAmount.toFixed(2)}`,
    );

    // Start a transaction to ensure all operations succeed or fail together
    console.log("[placeOrder] Starting database transaction...");
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const discountInfo = {
        originalAmount: originalTotalAmount,
        discountAmount: discountAmount,
        tierApplied: userTier,
        // Use the locally defined TIER_DISCOUNTS here too
        discountPercentage:
          (TIER_DISCOUNTS[userTier as keyof typeof TIER_DISCOUNTS] || 0) * 100,
      };

      const orderNotes = validatedData.orderNotes
        ? `${validatedData.orderNotes}\n\n--- System Notes ---\n${JSON.stringify(discountInfo)}`
        : `--- System Notes ---\n${JSON.stringify(discountInfo)}`;

      console.log("[placeOrder Tx] Creating order record...");
      const order = await tx.order.create({
        data: {
          ...validatedData, // Spread validated form fields
          totalAmount, // Use the calculated discounted amount
          orderNotes, // Include system notes
          userId: user.id,
          status: "PENDING", // Initial status
        },
      });
      console.log(`[placeOrder Tx] Order created with ID: ${order.id}`);

      // 2. Create order items from cart items and update stock
      console.log(
        `[placeOrder Tx] Processing ${cart.cartItems.length} cart items...`,
      );
      for (const cartItem of cart.cartItems) {
        // ** Add check for variation existence again inside loop for safety **
        if (
          !cartItem.variation ||
          typeof cartItem.variation.price !== "number" ||
          typeof cartItem.quantity !== "number"
        ) {
          console.error(
            `[placeOrder Tx] Invalid cart item data within transaction loop: VariationId=${cartItem.variationId}`,
          );
          throw new Error(
            `Invalid data for item with variation ID ${cartItem.variationId} during transaction.`,
          );
        }

        const originalPrice = cartItem.variation.price;
        const discountedPrice = calculateDiscountedPrice(
          originalPrice,
          userTier,
        );

        console.log(
          `[placeOrder Tx] Processing item: VariationId=${cartItem.variationId}, Qty=${cartItem.quantity}, OriginalPrice=${originalPrice}, DiscountedPrice=${discountedPrice}`,
        );

        // Check stock BEFORE creating order item and updating variation
        const currentVariation = await tx.variation.findUnique({
          where: { id: cartItem.variationId },
          select: { quantity: true, name: true }, // Select name for error message
        });

        if (!currentVariation) {
          throw new Error(
            `Variation with ID ${cartItem.variationId} not found during transaction.`,
          );
        }

        // ** Check variation quantity type **
        if (typeof currentVariation.quantity !== "number") {
          throw new Error(
            `Invalid stock quantity type for variation ${cartItem.variationId}. Expected number.`,
          );
        }

        const newQuantity = currentVariation.quantity - cartItem.quantity;
        console.log(
          `[placeOrder Tx] Stock check for ${currentVariation.name} (ID: ${cartItem.variationId}): Current=${currentVariation.quantity}, Requested=${cartItem.quantity}, New=${newQuantity}`,
        );

        if (newQuantity < 0) {
          console.error(
            `[placeOrder Tx] Stock error for variation ${cartItem.variationId}`,
          );
          throw new Error(
            `Not enough stock for ${currentVariation.name || `variation ${cartItem.variationId}`}. Available: ${currentVariation.quantity}, Requested: ${cartItem.quantity}`,
          );
        }

        // Create the order item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variationId: cartItem.variationId,
            quantity: cartItem.quantity,
            price: discountedPrice, // Store the final price paid per item
          },
        });
        console.log(
          `[placeOrder Tx] OrderItem created for VariationId ${cartItem.variationId}.`,
        );

        // Update the variation quantity (reduce stock)
        await tx.variation.update({
          where: { id: cartItem.variationId },
          data: { quantity: newQuantity },
        });
        console.log(
          `[placeOrder Tx] Variation ${cartItem.variationId} stock updated to ${newQuantity}.`,
        );
      }

      // 4. Clear the cart (within the transaction)
      console.log(
        `[placeOrder Tx] Clearing cart items for CartId ${cart.id}...`,
      );
      const { count } = await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      console.log(`[placeOrder Tx] ${count} cart items deleted.`);

      console.log("[placeOrder Tx] Transaction successful.");
      return {
        // Return necessary data from the transaction
        success: true,
        orderId: order.id,
      };
    }); // End of Prisma Transaction

    // If transaction was successful:
    if (transactionResult.success) {
      console.log(
        `[placeOrder] Transaction committed successfully. Order ID: ${transactionResult.orderId}. Triggering revalidation...`,
      );
      revalidatePath("/cart");
      revalidatePath("/orders"); // Revalidate user's order list
      revalidatePath(`/orders/confirmation/${transactionResult.orderId}`); // Revalidate specific confirmation page if cached
      revalidatePath("/checkout");
      console.log("[placeOrder] Revalidation triggered.");

      return {
        success: true,
        message: "Order placed successfully",
        orderId: transactionResult.orderId,
      };
    } else {
      console.error("[placeOrder] Transaction failed to return success state.");
      return {
        success: false,
        message: "Order placement failed after transaction block.",
      };
    }
  } catch (error) {
    console.error("-----------------------------------------");
    console.error("[placeOrder] CRITICAL ERROR CAUGHT:");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Raw Error:", error);

    if (error && typeof error === "object" && "code" in error) {
      console.error("Prisma Error Code:", error.code);
      if ("meta" in error && error.meta) {
        console.error("Prisma Error Meta:", JSON.stringify(error.meta));
      }
      if ("message" in error) {
        console.error("Prisma Error Message:", error.message);
      }
    } else if (error instanceof z.ZodError) {
      console.error(
        "Zod Validation Error Details:",
        JSON.stringify(error.flatten(), null, 2),
      );
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          fieldErrors[err.path.join(".")] = err.message;
        }
      });
      console.error("-----------------------------------------");
      return {
        success: false,
        message: "Please check the form for errors",
        errors: fieldErrors,
      };
    } else if (error instanceof Error) {
      console.error("Error Type: Generic Error");
      console.error("Error Name:", error.name);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);

      if (error.message.includes("Not enough stock")) {
        console.error("-----------------------------------------");
        return {
          success: false,
          message: error.message,
        };
      }
      // *** ADDED Check for the client/server boundary error specifically ***
      if (error.message.includes("You cannot dot into a client module")) {
        console.error(
          "Detected Client/Server boundary error. Ensure TIER_DISCOUNTS is defined locally.",
        );
        // Return a more specific message if desired, but the generic one is okay too
      }
    } else {
      console.error("Error Type: Unknown");
      console.error("Error Value:", String(error));
    }
    console.error("-----------------------------------------");

    return {
      success: false,
      message:
        error instanceof Error && error.message.includes("Not enough stock")
          ? error.message
          : "Failed to place your order due to an internal error. Please try again later.",
    };
  }
}

/**
 * Function to get order details after placement
 */
export async function getOrderDetails(
  orderId: string,
): Promise<GetOrderDetailsResponse> {
  console.log(`[Server Action] getOrderDetails called for orderId: ${orderId}`);
  try {
    const { user, session } = await validateRequest();
    if (!user || !session) {
      console.warn(
        `[getOrderDetails] User not authenticated trying to access order ${orderId}`,
      );
      return {
        success: false,
        message: "You must be logged in to view order details",
      };
    }
    console.log(`[getOrderDetails] User ${user.id} authenticated.`);

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.warn(
        `[getOrderDetails] Order ${orderId} not found for user ${user.id}.`,
      );
      return {
        success: false,
        message: "Order not found or you do not have permission to view it.",
      };
    }

    console.log(
      `[getOrderDetails] Successfully retrieved order ${orderId} for user ${user.id}.`,
    );
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error(
      `[getOrderDetails] Error retrieving order ${orderId}:`,
      error,
    );
    return {
      success: false,
      message: "Failed to retrieve order details due to an internal error.",
    };
  }
}

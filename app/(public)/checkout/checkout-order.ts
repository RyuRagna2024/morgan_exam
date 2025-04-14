"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { orderValidationSchema } from "./order-validations";
import {
  OrderInput,
  PlaceOrderResponse,
  GetOrderDetailsResponse,
} from "./order-types";
import { TIER_DISCOUNTS } from "../(group-products)/_components/(filterside)/tier-util";

// Define tier discounts directly in the server component to avoid client/server module issues

// Calculate the discounted price based on user tier
function calculateDiscountedPrice(price: number, tier: string): number {
  const discountPercentage =
    TIER_DISCOUNTS[tier as keyof typeof TIER_DISCOUNTS] || 0;
  return price * (1 - discountPercentage);
}

/**
 * Server action to place an order with items from the user's cart
 * This will:
 * 1. Create a new order with the provided details
 * 2. Transfer cart items to order items
 * 3. Update product variation quantities
 * 4. Clear the cart
 */
export async function placeOrder(
  formData: OrderInput,
): Promise<PlaceOrderResponse> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session || user.role !== "CUSTOMER") {
      return {
        success: false,
        message: "You must be logged in to place an order",
      };
    }

    // Validate input data
    const validatedData = orderValidationSchema.parse(formData);

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        cartItems: {
          include: {
            variation: true,
          },
        },
      },
    });

    // Check if cart exists and has items
    if (!cart || cart.cartItems.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
      };
    }

    // Get user's tier for discount calculation
    const userWithTier = await prisma.user.findUnique({
      where: { id: user.id },
      select: { tier: true },
    });

    const userTier = userWithTier?.tier || "BRONZE";

    // Calculate total order amount with tier discount applied
    const originalTotalAmount = cart.cartItems.reduce(
      (sum, item) => sum + item.variation.price * item.quantity,
      0,
    );

    // Apply tier discount to total amount
    const totalAmount = cart.cartItems.reduce(
      (sum, item) =>
        sum +
        calculateDiscountedPrice(item.variation.price, userTier) *
          item.quantity,
      0,
    );

    // Calculate the discount amount
    const discountAmount = originalTotalAmount - totalAmount;

    // Start a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      // 1. Create the order
      // Store the original amount and discount info in orderNotes since schema doesn't have those fields
      const discountInfo = {
        originalAmount: originalTotalAmount,
        discountAmount: discountAmount,
        tierApplied: userTier,
        discountPercentage:
          TIER_DISCOUNTS[userTier as keyof typeof TIER_DISCOUNTS] * 100,
      };

      const orderNotes = validatedData.orderNotes
        ? `${validatedData.orderNotes}\n\n--- System Notes ---\n${JSON.stringify(discountInfo)}`
        : `--- System Notes ---\n${JSON.stringify(discountInfo)}`;

      const order = await tx.order.create({
        data: {
          ...validatedData,
          totalAmount, // This is already the discounted amount
          orderNotes,
          userId: user.id,
          status: "PENDING",
        },
      });

      // 2. Create order items from cart items
      await Promise.all(
        cart.cartItems.map(async (cartItem) => {
          const originalPrice = cartItem.variation.price;
          const discountedPrice = calculateDiscountedPrice(
            originalPrice,
            userTier,
          );

          // Create the order item - store only what the schema allows
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              variationId: cartItem.variationId,
              quantity: cartItem.quantity,
              price: discountedPrice, // Store the discounted price
            },
          });

          // 3. Update the variation quantity (reduce stock)
          const newQuantity = cartItem.variation.quantity - cartItem.quantity;

          // Ensure we don't set negative quantities
          if (newQuantity < 0) {
            throw new Error(
              `Not enough stock for ${cartItem.variation.name}. Available: ${cartItem.variation.quantity}, Requested: ${cartItem.quantity}`,
            );
          }

          await tx.variation.update({
            where: { id: cartItem.variationId },
            data: { quantity: newQuantity },
          });
        }),
      );

      // 4. Clear the cart (within the transaction)
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Revalidate relevant paths
      revalidatePath("/cart");
      revalidatePath("/orders");
      revalidatePath("/checkout");

      return {
        success: true,
        message: "Order placed successfully",
        orderId: order.id,
      };
    });
  } catch (error) {
    console.error("Place order error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          fieldErrors[err.path.join(".")] = err.message;
        }
      });

      return {
        success: false,
        message: "Please check the form for errors",
        errors: fieldErrors,
      };
    }

    // Handle stock errors
    if (error instanceof Error && error.message.includes("Not enough stock")) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Failed to place your order. Please try again.",
    };
  }
}

/**
 * Function to get order details after placement
 */
export async function getOrderDetails(
  orderId: string,
): Promise<GetOrderDetailsResponse> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session) {
      return {
        success: false,
        message: "You must be logged in to view order details",
      };
    }

    // Get the order with items
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id, // Ensure the order belongs to the authenticated user
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
      return {
        success: false,
        message: "Order not found",
      };
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Get order details error:", error);
    return {
      success: false,
      message: "Failed to retrieve order details",
    };
  }
}

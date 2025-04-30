// app/(public)/productId/cart/_cart-actions/get-cart-count.ts

"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

/**
 * Server action to get the current cart item count
 */
export async function getCartCount(): Promise<{
  success: boolean;
  cartItemCount: number;
  message?: string;
}> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session) {
      return {
        success: false,
        cartItemCount: 0,
        message: "User not authenticated",
      };
    }

    // Find the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { cartItems: true },
    });

    // Calculate total items in cart
    const cartItemCount =
      cart?.cartItems.reduce((total, item) => total + item.quantity, 0) || 0;

    return {
      success: true,
      cartItemCount,
    };
  } catch (error) {
    console.error("Get cart count error:", error);
    return {
      success: false,
      cartItemCount: 0,
      message: "Failed to get cart count",
    };
  }
}

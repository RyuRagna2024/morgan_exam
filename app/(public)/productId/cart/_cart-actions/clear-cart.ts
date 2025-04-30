// app/(public)/productId/cart/_cart-actions/clear-cart.ts

"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Server action to clear all items from the user's cart
 */
export async function clearCart(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session) {
      return {
        success: false,
        message: "You must be logged in to clear your cart",
      };
    }

    // Find the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return {
        success: false,
        message: "Cart not found",
      };
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Revalidate cart pages to reflect the changes
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Cart cleared successfully",
    };
  } catch (error) {
    console.error("Clear cart error:", error);

    return {
      success: false,
      message: "Failed to clear cart. Please try again.",
    };
  }
}

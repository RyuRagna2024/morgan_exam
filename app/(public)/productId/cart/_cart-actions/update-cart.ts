"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

// Schema for validating input
const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
  quantity: z.number().int().min(0),
});

type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

/**
 * Server action to update the quantity of a cart item
 * If quantity is 0, the item will be removed from the cart
 */
export async function updateCartItem(
  formData: UpdateCartItemInput,
): Promise<{ success: boolean; message: string; cartItemCount?: number }> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session) {
      return {
        success: false,
        message: "You must be logged in to update your cart",
      };
    }

    // Validate input data
    const validatedData = updateCartItemSchema.parse(formData);
    const { cartItemId, quantity } = validatedData;

    // Get the cart item and verify it belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, variation: true },
    });

    if (!cartItem) {
      return {
        success: false,
        message: "Cart item not found",
      };
    }

    if (cartItem.cart.userId !== user.id) {
      return {
        success: false,
        message: "Unauthorized access to cart item",
      };
    }

    // If quantity is 0, remove the item from the cart
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Check stock availability
      if (cartItem.variation.quantity < quantity) {
        return {
          success: false,
          message: `Only ${cartItem.variation.quantity} items available in stock`,
        };
      }

      // Update the quantity
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    // Get updated cart item count
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { cartItems: true },
    });

    // Calculate total items in cart
    const cartItemCount =
      updatedCart?.cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ) || 0;

    // Revalidate cart pages to reflect the changes
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      success: true,
      message:
        quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
      cartItemCount,
    };
  } catch (error) {
    console.error("Update cart item error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input data",
      };
    }

    return {
      success: false,
      message: "Failed to update cart. Please try again.",
    };
  }
}

"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

// Schema for validating input
const addToCartSchema = z.object({
  variationId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

type AddToCartInput = z.infer<typeof addToCartSchema>;

/**
 * Server action to add a product variation to the user's cart
 */
export async function addToCart(
  formData: AddToCartInput,
): Promise<{ success: boolean; message: string; cartItemCount?: number }> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session) {
      return {
        success: false,
        message: "You must be logged in to add items to your cart",
      };
    }

    // Validate input data
    const validatedData = addToCartSchema.parse(formData);
    const { variationId, quantity } = validatedData;

    // Check if the variation exists
    const variation = await prisma.variation.findUnique({
      where: { id: variationId },
    });

    if (!variation) {
      return {
        success: false,
        message: "Product variation not found",
      };
    }

    // Check if the requested quantity is available
    if (variation.quantity < quantity) {
      return {
        success: false,
        message: `Only ${variation.quantity} items available in stock`,
      };
    }

    // Find or create the user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { cartItems: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
        include: { cartItems: true },
      });
    }

    // Check if this variation is already in the cart
    const existingCartItem = cart.cartItems.find(
      (item) => item.variationId === variationId,
    );

    if (existingCartItem) {
      // Update the quantity if it already exists
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Add new cart item if it doesn't exist
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variationId,
          quantity,
        },
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
      message: "Item added to cart successfully",
      cartItemCount,
    };
  } catch (error) {
    console.error("Add to cart error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input data",
      };
    }

    return {
      success: false,
      message: "Failed to add item to cart. Please try again.",
    };
  }
}

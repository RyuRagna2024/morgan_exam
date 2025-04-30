// app/(public)/productId/cart/_cart-actions/get-cart-items.ts

"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

// Updated interface to match your actual schema
export interface CartItemWithDetails {
  id: string;
  variationId: string;
  quantity: number;
  variation: {
    id: string;
    name: string;
    price: number;
    quantity: number; // Available stock
    imageUrl: string;
    product: {
      id: string;
      productName: string; // Changed from name to productName
      productImgUrl: string; // Added this as it might be needed
    };
  };
}

/**
 * Server action to fetch cart items with product details
 */
export async function getCartItems(): Promise<{
  success: boolean;
  items: CartItemWithDetails[];
  message?: string;
}> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session) {
      return {
        success: false,
        items: [],
        message: "You must be logged in to view your cart",
      };
    }

    // Find the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        cartItems: {
          include: {
            variation: {
              include: {
                product: true, // Include the full product
              },
            },
          },
        },
      },
    });

    if (!cart || !cart.cartItems) {
      return {
        success: true,
        items: [],
      };
    }

    // Transform the data to match the CartItemWithDetails interface
    // This explicitly maps the fields based on your actual schema
    const transformedItems = cart.cartItems.map((item) => ({
      id: item.id,
      variationId: item.variationId,
      quantity: item.quantity,
      variation: {
        id: item.variation.id,
        name: item.variation.name,
        price: item.variation.price,
        quantity: item.variation.quantity,
        imageUrl: item.variation.imageUrl,
        product: {
          id: item.variation.product.id,
          productName: item.variation.product.productName, // Using productName instead of name
          productImgUrl: item.variation.product.productImgUrl, // Using productImgUrl
        },
      },
    }));

    return {
      success: true,
      items: transformedItems,
    };
  } catch (error) {
    console.error("Get cart items error:", error);
    return {
      success: false,
      items: [],
      message: "Failed to fetch cart items. Please try again.",
    };
  }
}

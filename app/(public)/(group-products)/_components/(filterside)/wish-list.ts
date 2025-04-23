// app/(public)/(group-products)/_components/(filterside)/wish-list.ts

"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

// Interface for the result of wishlist actions
export interface WishlistActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Add a product variation to the user's wishlist
 */
export async function addToWishlist(
  variationId: string,
): Promise<WishlistActionResult> {
  try {
    // Get the current user using Lucia auth
    const { user } = await validateRequest();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to add items to your wishlist",
      };
    }

    const userId = user.id;

    // Verify the variation exists
    const variation = await prisma.variation.findUnique({
      where: { id: variationId },
    });

    if (!variation) {
      return {
        success: false,
        error: "Product variation not found",
      };
    }

    // Find or create user's wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
      });
    }

    // Check if the variation is already in the wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        variationId,
      },
    });

    if (existingItem) {
      return {
        success: true,
        message: "Item is already in your wishlist",
      };
    }

    // Add the variation to the wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        variationId,
      },
    });

    return {
      success: true,
      message: "Item added to your wishlist",
    };
  } catch (error) {
    console.error("Server Error adding to wishlist:", error);
    return {
      success: false,
      error: "Failed to add item to wishlist",
    };
  }
}

/**
 * Remove a product variation from the user's wishlist
 */
export async function removeFromWishlist(
  variationId: string,
): Promise<WishlistActionResult> {
  try {
    // Get the current user using Lucia auth
    const { user } = await validateRequest();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to manage your wishlist",
      };
    }

    const userId = user.id;

    // Find user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      return {
        success: false,
        error: "Wishlist not found",
      };
    }

    // Remove the item from wishlist
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        variationId,
      },
    });

    return {
      success: true,
      message: "Item removed from your wishlist",
    };
  } catch (error) {
    console.error("Server Error removing from wishlist:", error);
    return {
      success: false,
      error: "Failed to remove item from wishlist",
    };
  }
}

/**
 * Get the current user's wishlist with all variations
 */
export async function getUserWishlist(): Promise<{
  success: boolean;
  error?: string;
  wishlistItems?: Array<{
    id: string;
    variationId: string;
    variation: {
      id: string;
      name: string;
      color: string;
      size: string;
      sku: string;
      quantity: number;
      price: number;
      imageUrl: string;
      product: {
        id: string;
        productName: string;
        productImgUrl: string;
        sellingPrice: number;
      };
    };
  }>;
}> {
  try {
    // Get the current user using Lucia auth
    const { user } = await validateRequest();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to view your wishlist",
      };
    }

    const userId = user.id;

    // Find user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variation: {
              include: {
                product: {
                  select: {
                    id: true,
                    productName: true,
                    productImgUrl: true,
                    sellingPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      // User has no wishlist yet, return empty array
      return {
        success: true,
        wishlistItems: [],
      };
    }

    return {
      success: true,
      wishlistItems: wishlist.items,
    };
  } catch (error) {
    console.error("Server Error fetching wishlist:", error);
    return {
      success: false,
      error: "Failed to fetch wishlist",
    };
  }
}

/**
 * Check if a variation is in the user's wishlist
 */
export async function isInWishlist(variationId: string): Promise<{
  success: boolean;
  error?: string;
  isInWishlist: boolean;
}> {
  try {
    // Get the current user using Lucia auth
    const { user } = await validateRequest();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to check wishlist status",
        isInWishlist: false,
      };
    }

    const userId = user.id;

    // Find user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      return {
        success: true,
        isInWishlist: false,
      };
    }

    // Check if the variation is in the wishlist
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        variationId,
      },
    });

    return {
      success: true,
      isInWishlist: !!wishlistItem,
    };
  } catch (error) {
    console.error("Server Error checking wishlist status:", error);
    return {
      success: false,
      error: "Failed to check wishlist status",
      isInWishlist: false,
    };
  }
}

/**
 * Toggle a product variation in the user's wishlist
 * This adds it if not present, removes it if already present
 */
export async function toggleWishlistItem(variationId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  added?: boolean;
}> {
  try {
    // Get the current user using Lucia auth
    const { user } = await validateRequest();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to manage your wishlist",
      };
    }

    const userId = user.id;

    // Find or create user's wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
      });
    }

    // Check if the variation is already in the wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        variationId,
      },
    });

    // If item exists, remove it
    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });

      return {
        success: true,
        message: "Item removed from your wishlist",
        added: false,
      };
    }

    // Otherwise, add it
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        variationId,
      },
    });

    return {
      success: true,
      message: "Item added to your wishlist",
      added: true,
    };
  } catch (error) {
    console.error("Server Error toggling wishlist item:", error);
    return {
      success: false,
      error: "Failed to update wishlist",
    };
  }
}

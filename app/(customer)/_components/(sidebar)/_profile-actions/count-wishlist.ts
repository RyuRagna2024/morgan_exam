"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

interface WishlistCountResponse {
  success: boolean;
  wishlistItemCount?: number;
  error?: string;
}

/**
 * Get the count of items in the customer's wishlist
 */
export async function getCustomerWishlistCount(): Promise<WishlistCountResponse> {
  try {
    const { user } = await validateRequest();

    // If no user is logged in, return 0
    if (!user) {
      return {
        success: true,
        wishlistItemCount: 0,
      };
    }

    // Find the user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    // If no wishlist exists, return 0
    if (!wishlist) {
      return {
        success: true,
        wishlistItemCount: 0,
      };
    }

    return {
      success: true,
      wishlistItemCount: wishlist._count.items,
    };
  } catch (error) {
    console.error("Error counting wishlist items:", error);
    return {
      success: false,
      error: "Failed to count wishlist items",
    };
  }
}

// app/(public)/(group-products)/_components/(filterside)/product-fetch.ts

"use server";

import prisma from "@/lib/prisma";
import { ProductActionResult } from "./types";
import { validateRequest } from "@/auth";

/**
 * Fetches all products from the database with their variations,
 * regardless of category, but maintains category information
 */
export async function getAllProducts(): Promise<ProductActionResult> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        productName: true,
        category: true,
        productImgUrl: true,
        description: true,
        sellingPrice: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        Variation: {
          select: {
            id: true,
            name: true,
            color: true,
            size: true,
            sku: true,
            quantity: true,
            price: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Log category distribution for debugging
    const categoryDistribution = products.reduce<Record<string, number>>(
      (acc, product) => {
        if (product.category) {
          product.category.forEach((cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
          });
        }
        return acc;
      },
      {},
    );

    // Transform the data to match frontend expectations
    const transformedProducts = products.map((product) => {
      // Create a copy without Variation to avoid property name conflicts
      const { Variation, ...productData } = product;

      // Return a new object with variations property
      return {
        ...productData,
        variations: Variation,
      };
    });

    return {
      success: true,
      products: transformedProducts,
    };
  } catch (error) {
    console.error("Server Error fetching all products:", error);
    return {
      success: false,
      error: "Failed to fetch all products",
    };
  }
}

/**
 * Fetches a single product by ID with its variations
 * Also checks if the variations are in the user's wishlist
 */
export async function getProductById(
  productId: string,
): Promise<ProductActionResult & { wishlistStatus?: Record<string, boolean> }> {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isPublished: true,
      },
      select: {
        id: true,
        productName: true,
        category: true,
        productImgUrl: true,
        description: true,
        sellingPrice: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        Variation: {
          select: {
            id: true,
            name: true,
            color: true,
            size: true,
            sku: true,
            quantity: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Transform the product data
    const { Variation, ...productData } = product;
    const transformedProduct = {
      ...productData,
      variations: Variation,
    };

    // Check if the user is logged in using Lucia auth
    const { user } = await validateRequest();
    let wishlistStatus: Record<string, boolean> = {};

    if (user) {
      const userId = user.id;

      // Find the user's wishlist
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
          items: {
            select: {
              variationId: true,
            },
          },
        },
      });

      if (wishlist) {
        // Create a map of variation IDs to wishlist status
        const wishlistVariationIds = new Set(
          wishlist.items.map((item) => item.variationId),
        );

        // Set wishlist status for each variation
        wishlistStatus = Variation.reduce(
          (acc, variation) => {
            acc[variation.id] = wishlistVariationIds.has(variation.id);
            return acc;
          },
          {} as Record<string, boolean>,
        );
      }
    }

    return {
      success: true,
      product: transformedProduct,
      wishlistStatus,
    };
  } catch (error) {
    console.error(`Server Error fetching product with ID ${productId}:`, error);
    return {
      success: false,
      error: "Failed to fetch product",
    };
  }
}

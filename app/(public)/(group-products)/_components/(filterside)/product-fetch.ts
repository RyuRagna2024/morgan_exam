"use server";

import prisma from "@/lib/prisma";
import {
  ProductActionResult,
  ProductWithVariations,
  Variation as VariationType, // Assuming Variation interface is defined in types.ts
} from "./types"; // Adjust path if needed
import { validateRequest } from "@/auth";
import { Prisma } from "@prisma/client";

/**
 * Fetches all products from the database with their variations.
 * (Ensure select includes all fields needed by ProductWithVariations)
 */
export async function getAllProducts(): Promise<ProductActionResult> {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      include: {
        // Using include fetches all fields by default
        Variation: true, // Include all variation fields
      },
      orderBy: { createdAt: "asc" },
    });

    // Map Prisma's Variation[] to variations[] if needed by your type
    const transformedProducts = products.map((product) => {
      const { Variation, ...productData } = product;
      return { ...productData, variations: Variation }; // Matches ProductWithVariations
    });

    return {
      success: true,
      products: transformedProducts as ProductWithVariations[],
    }; // Assert type
  } catch (error) {
    console.error("Server Error fetching all products:", error);
    return { success: false, error: "Failed to fetch all products" };
  }
}

/**
 * Fetches a single product by ID with its variations and wishlist status.
 * (Ensure select includes all fields needed by ProductWithVariations)
 */
export async function getProductById(
  productId: string,
): Promise<ProductActionResult & { wishlistStatus?: Record<string, boolean> }> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId, isPublished: true },
      include: {
        // Using include fetches all fields by default
        Variation: true, // Include all variation fields
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const { Variation, ...productData } = product;
    const transformedProduct = { ...productData, variations: Variation };

    // Check wishlist status
    const { user } = await validateRequest();
    let wishlistStatus: Record<string, boolean> = {};
    if (user) {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId: user.id },
        include: { items: { select: { variationId: true } } },
      });
      if (wishlist) {
        const wishlistVariationIds = new Set(
          wishlist.items.map((item) => item.variationId),
        );
        // Use Variation from the fetched product which has all fields
        wishlistStatus = Variation.reduce(
          (acc: Record<string, boolean>, v: VariationType) => {
            acc[v.id] = wishlistVariationIds.has(v.id);
            return acc;
          },
          {} as Record<string, boolean>,
        );
      }
    }

    return {
      success: true,
      // Ensure transformedProduct matches ProductWithVariations structure
      product: transformedProduct as ProductWithVariations, // Assert type
      wishlistStatus,
    };
  } catch (error) {
    console.error(`Server Error fetching product with ID ${productId}:`, error);
    return { success: false, error: "Failed to fetch product" };
  }
}

/**
 * Fetches related products based on category.
 * (Ensure select includes all fields needed by ProductWithVariations)
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4,
): Promise<ProductActionResult> {
  console.log(`Fetching related products for ${productId}`);
  try {
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { category: true },
    });

    if (!currentProduct || currentProduct.category.length === 0) {
      return { success: true, products: [] };
    }

    const related = await prisma.product.findMany({
      where: {
        id: { not: productId },
        isPublished: true,
        category: { hasSome: currentProduct.category },
      },
      take: limit,
      include: {
        // Use include to get all fields
        Variation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedProducts = related.map((product) => {
      const { Variation, ...productData } = product;
      return { ...productData, variations: Variation };
    });

    return {
      success: true,
      products: transformedProducts as ProductWithVariations[],
    }; // Assert type
  } catch (error) {
    console.error(
      `Server Error fetching related products for ${productId}:`,
      error,
    );
    return {
      success: false,
      error: "Failed to fetch related products",
      products: [],
    };
  }
}

/**
 * Fetches featured products.
 * Excludes the currently viewed product if its ID is provided.
 */
export async function getFeaturedProducts(options?: {
  limit?: number;
  excludeProductId?: string;
}): Promise<ProductActionResult> {
  const limit = options?.limit ?? 5;
  const excludeProductId = options?.excludeProductId;

  try {
    const whereClause: Prisma.ProductWhereInput = {
      isFeatured: true,
      isPublished: true,
      ...(excludeProductId && { id: { not: excludeProductId } }),
    };
    console.log(
      "[getFeaturedProducts] Fetching with where clause:",
      JSON.stringify(whereClause),
    );

    const products = await prisma.product.findMany({
      where: whereClause,
      take: limit,
      // --- Use include to fetch all Product and nested Variation fields ---
      include: {
        Variation: true, // Fetch all variation fields
      },
      // --- END Use include ---
      orderBy: { updatedAt: "desc" },
    });

    console.log(
      `[getFeaturedProducts] Raw products fetched (${products.length}):`,
      JSON.stringify(
        products.map((p) => ({
          id: p.id,
          name: p.productName,
          featured: p.isFeatured,
        })),
        null,
        2,
      ),
    );

    // --- Map Prisma's default 'Variation' to 'variations' if your type requires it ---
    const transformedProducts = products.map((product) => {
      const { Variation, ...productData } = product; // Destructure Prisma's default relation name
      return {
        ...productData,
        variations: Variation, // Assign the array to the 'variations' key
      }; // Now this structure should match ProductWithVariations
    });
    // --- END Mapping ---

    console.log(
      `[getFeaturedProducts] Transformed products (${transformedProducts.length}) being returned.`,
    );

    // --- Return the correctly structured data, asserting the type ---
    return {
      success: true,
      products: transformedProducts as ProductWithVariations[],
    };
    // --- END Return ---
  } catch (error) {
    console.error("[getFeaturedProducts] Server Error:", error);
    return {
      success: false,
      error: "Failed to fetch featured products",
      products: [],
    };
  }
}

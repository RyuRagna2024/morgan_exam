// app/(public)/(group-products)/_components/(filterside)/product-fetch.ts
"use server";

import prisma from "@/lib/prisma";
import {
  ProductActionResult,
  ProductWithVariations,
  Variation as VariationType,
} from "./types"; // Import Variation type alias if defined in types.ts
import { validateRequest } from "@/auth";
import { Prisma } from "@prisma/client";

/**
 * Fetches all products from the database with their variations.
 */
export async function getAllProducts(): Promise<ProductActionResult> {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
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
        // --- CORRECTED: Use capital 'Variation' ---
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
        // --- End Correction ---
      },
      orderBy: { createdAt: "asc" },
    });

    // Transform data
    const transformedProducts = products.map((product) => {
      // --- CORRECTED: Use capital 'Variation' ---
      const { Variation, ...productData } = product;
      // --- End Correction ---
      // Assign to 'variations' (lowercase) as expected by ProductWithVariations type
      return { ...productData, variations: Variation };
    });

    return { success: true, products: transformedProducts };
  } catch (error) {
    console.error("Server Error fetching all products:", error);
    return { success: false, error: "Failed to fetch all products" };
  }
}

/**
 * Fetches a single product by ID with its variations and wishlist status.
 */
export async function getProductById(
  productId: string,
): Promise<ProductActionResult & { wishlistStatus?: Record<string, boolean> }> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId, isPublished: true },
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
        // --- CORRECTED: Use capital 'Variation' ---
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
        // --- End Correction ---
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Transform the product data
    // --- CORRECTED: Use capital 'Variation' ---
    const { Variation, ...productData } = product;
    // --- End Correction ---
    const transformedProduct = { ...productData, variations: Variation }; // Assign to 'variations'

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
        // --- CORRECTED: Use capital 'Variation' from fetched product ---
        // --- ADDED explicit types for reduce parameters ---
        wishlistStatus = Variation.reduce(
          (acc: Record<string, boolean>, v: VariationType) => {
            // Use VariationType from import or define locally
            acc[v.id] = wishlistVariationIds.has(v.id);
            return acc;
          },
          {} as Record<string, boolean>,
        );
        // --- End Correction / Type Add ---
      }
    }

    return {
      success: true,
      product: transformedProduct,
      wishlistStatus,
    };
  } catch (error) {
    console.error(`Server Error fetching product with ID ${productId}:`, error);
    return { success: false, error: "Failed to fetch product" };
  }
}

/**
 * Fetches related products based on category.
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4,
): Promise<ProductActionResult> {
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
        // --- CORRECTED: Use capital 'Variation' ---
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
        // --- End Correction ---
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the data
    const transformedProducts = related.map((product) => {
      // --- CORRECTED: Use capital 'Variation' ---
      const { Variation, ...productData } = product;
      // --- End Correction ---
      return { ...productData, variations: Variation }; // Assign to 'variations'
    });

    return { success: true, products: transformedProducts };
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

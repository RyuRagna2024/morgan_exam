"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";

// Constants for validation
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];
const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB

// Response types
interface OnSaleResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Create action
export async function createOnSale(
  formData: FormData,
): Promise<OnSaleResponse> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/");
    }

    // Get form data
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const originalPrice = parseFloat(formData.get("originalPrice") as string);
    const salePrice = parseFloat(formData.get("salePrice") as string);
    const rating = parseInt(formData.get("rating") as string);

    // Validate inputs
    if (!file || !file.size) throw new Error("No image file provided");
    if (!name || !originalPrice || !salePrice || !rating) {
      throw new Error("All fields are required");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (originalPrice <= 0 || salePrice <= 0) {
      throw new Error("Prices must be greater than 0");
    }
    if (salePrice >= originalPrice) {
      throw new Error("Sale price must be less than original price");
    }

    // Validate image type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      throw new Error(
        "Invalid file type. Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF",
      );
    }

    // Validate image size
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("File size must be less than 6MB");
    }

    // Upload image to blob storage
    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `on-sale/product_${user.id}_${timestamp}.${fileExt}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    if (!blob.url) throw new Error("Failed to get URL from blob storage");

    // Create on sale item in database
    const onSaleItem = await prisma.onSale.create({
      data: {
        name,
        originalPrice,
        salePrice,
        rating,
        imageUrl: blob.url,
        userId: user.id,
      },
    });

    return {
      success: true,
      data: onSaleItem,
    };
  } catch (error) {
    console.error("Error creating on sale item:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Get all on sale items
export async function getOnSaleItems(): Promise<OnSaleResponse> {
  try {
    const items = await prisma.onSale.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching on sale items:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Get single on sale item by ID
export async function getOnSaleItemById(id: string): Promise<OnSaleResponse> {
  try {
    const onSaleItem = await prisma.onSale.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    if (!onSaleItem) {
      throw new Error("On sale item not found");
    }

    return {
      success: true,
      data: onSaleItem,
    };
  } catch (error) {
    console.error("Error fetching on sale item:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

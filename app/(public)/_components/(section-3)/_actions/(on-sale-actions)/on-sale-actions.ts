// app/(public)/_components/(section-3)/_actions/(on-sale-actions)/on-sale-actions.ts
"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob"; // Import del
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma types

// Constants (repeat or import)
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

// Response type
interface OnSaleResponse {
  success: boolean;
  data?: any; // Consider specific Prisma type
  error?: string;
}

// --- Create Action (Keep existing) ---
export async function createOnSale(
  formData: FormData,
): Promise<OnSaleResponse> {
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const originalPriceStr = formData.get("originalPrice") as string;
    const salePriceStr = formData.get("salePrice") as string;
    const ratingStr = formData.get("rating") as string;

    if (!file || !file.size) throw new Error("Image file is required");
    if (!name) throw new Error("Product name is required");
    const originalPrice = parseFloat(originalPriceStr);
    const salePrice = parseFloat(salePriceStr);
    const rating = parseInt(ratingStr);
    if (isNaN(originalPrice) || originalPrice <= 0)
      throw new Error("Valid original price required.");
    if (isNaN(salePrice) || salePrice <= 0)
      throw new Error("Valid sale price required.");
    if (salePrice >= originalPrice)
      throw new Error("Sale price must be less than original price.");
    if (isNaN(rating) || rating < 1 || rating > 5)
      throw new Error("Rating must be 1-5.");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      throw new Error("Invalid image type");
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Image size exceeds 6MB");

    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `on-sale/product_${user.id}_${timestamp}.${fileExt}`;
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });
    if (!blob.url) throw new Error("Failed to upload image");

    const onSaleItem = await prisma.onSale.create({
      data: {
        name,
        originalPrice,
        salePrice,
        rating,
        imageUrl: blob.url,
        userId: user.id,
      },
      include: { user: { select: { displayName: true } } },
    });

    return { success: true, data: onSaleItem };
  } catch (error) {
    console.error("Error creating on sale item:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// --- Get All Action (Keep existing) ---
export async function getOnSaleItems(): Promise<OnSaleResponse> {
  try {
    const items = await prisma.onSale.findMany({
      orderBy: { createdAt: "asc" },
      include: { user: { select: { displayName: true } } },
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching on sale items:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// --- Get By ID Action (Keep existing) ---
export async function getOnSaleItemById(id: string): Promise<OnSaleResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    const onSaleItem = await prisma.onSale.findUnique({
      where: { id },
      include: { user: { select: { displayName: true } } },
    });
    if (!onSaleItem) return { success: false, error: "On sale item not found" };
    return { success: true, data: onSaleItem };
  } catch (error) {
    console.error(`Error fetching on sale item ${id}:`, error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// --- NEW Delete Action ---
export async function deleteOnSaleItem(id: string): Promise<OnSaleResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    const itemToDelete = await prisma.onSale.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!itemToDelete) return { success: false, error: "Item not found." };

    await prisma.onSale.delete({ where: { id } });

    if (itemToDelete.imageUrl) {
      try {
        await del(itemToDelete.imageUrl);
        console.log(`Deleted blob: ${itemToDelete.imageUrl}`);
      } catch (blobError) {
        console.error(
          `Failed to delete blob ${itemToDelete.imageUrl}:`,
          blobError,
        );
      }
    }

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting on sale item:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// --- NEW Update Action ---
export async function updateOnSaleItem(
  id: string,
  formData: FormData,
): Promise<OnSaleResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    const name = formData.get("name") as string;
    const originalPriceStr = formData.get("originalPrice") as string;
    const salePriceStr = formData.get("salePrice") as string;
    const ratingStr = formData.get("rating") as string;
    const file = formData.get("image") as File | null;

    if (!name) throw new Error("Product name is required");
    const originalPrice = parseFloat(originalPriceStr);
    const salePrice = parseFloat(salePriceStr);
    const rating = parseInt(ratingStr);
    if (isNaN(originalPrice) || originalPrice <= 0)
      throw new Error("Valid original price required.");
    if (isNaN(salePrice) || salePrice <= 0)
      throw new Error("Valid sale price required.");
    if (salePrice >= originalPrice)
      throw new Error("Sale price must be less than original price.");
    if (isNaN(rating) || rating < 1 || rating > 5)
      throw new Error("Rating must be 1-5.");

    let imageUrl: string | undefined;
    let oldImageUrl: string | null = null;

    const existingItem = await prisma.onSale.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!existingItem) return { success: false, error: "Item not found." };
    oldImageUrl = existingItem.imageUrl;

    if (file && file.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type))
        throw new Error("Invalid image type.");
      if (file.size > MAX_IMAGE_SIZE) throw new Error("Image size too large.");

      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `on-sale/product_${id}_${timestamp}.${fileExt}`;
      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });
      if (!blob.url) throw new Error("Failed to upload new image.");
      imageUrl = blob.url;
      console.log(`Uploaded new image: ${imageUrl}`);

      if (oldImageUrl && oldImageUrl !== imageUrl) {
        try {
          await del(oldImageUrl);
          console.log(`Deleted old blob: ${oldImageUrl}`);
        } catch (blobError) {
          console.error(`Failed to delete old blob ${oldImageUrl}:`, blobError);
        }
      }
    }

    const dataToUpdate: Prisma.OnSaleUpdateInput = {
      name,
      originalPrice,
      salePrice,
      rating,
      ...(imageUrl && { imageUrl }),
    };

    const updatedItem = await prisma.onSale.update({
      where: { id },
      data: dataToUpdate,
      include: { user: { select: { displayName: true } } },
    });

    return { success: true, data: updatedItem };
  } catch (error) {
    console.error(`Error updating on sale item ${id}:`, error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

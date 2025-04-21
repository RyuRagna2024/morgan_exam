// app/(public)/_components/(section-3)/_actions/(best-seller-actions)/update-delete-actions.ts
"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
interface BestSellerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// --- Delete Action ---
export async function deleteBestSeller(
  id: string,
): Promise<BestSellerResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    const itemToDelete = await prisma.bestSeller.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!itemToDelete) return { success: false, error: "Item not found." };

    await prisma.bestSeller.delete({ where: { id } });

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
    console.error("Error deleting best seller:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// --- Update Action ---
export async function updateBestSeller(
  id: string,
  formData: FormData,
): Promise<BestSellerResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const ratingStr = formData.get("rating") as string;
    const file = formData.get("image") as File | null;

    if (!name) throw new Error("Product name is required");
    const price = parseFloat(priceStr);
    const rating = parseInt(ratingStr);
    if (isNaN(price) || price <= 0) throw new Error("Valid price is required");
    if (isNaN(rating) || rating < 1 || rating > 5)
      throw new Error("Rating must be 1-5");

    let imageUrl: string | undefined;
    let oldImageUrl: string | null = null;

    const existingItem = await prisma.bestSeller.findUnique({
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
      const path = `best-seller/product_${id}_${timestamp}.${fileExt}`;
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

    const dataToUpdate: Prisma.BestSellerUpdateInput = {
      name,
      price,
      rating,
      ...(imageUrl && { imageUrl }),
    };

    const updatedItem = await prisma.bestSeller.update({
      where: { id },
      data: dataToUpdate,
      include: { user: { select: { displayName: true } } },
    });

    return { success: true, data: updatedItem };
  } catch (error) {
    console.error(`Error updating best seller ${id}:`, error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

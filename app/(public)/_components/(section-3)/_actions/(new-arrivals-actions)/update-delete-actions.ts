// app/(public)/_components/(section-3)/_actions/(new-arrivals-actions)/update-delete-actions.ts
"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob"; // Import put and del
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma types

// Constants for validation (repeat or import from a shared file)
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
interface NewArrivalResponse {
  success: boolean;
  data?: any; // Consider a specific Prisma type like Prisma.NewArrivalGetPayload<{ include: { user: true } }>
  error?: string;
}

// --- Delete Action ---
export async function deleteNewArrival(
  id: string,
): Promise<NewArrivalResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    // Validate user
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    // Find the item first to get the imageUrl for deletion
    const itemToDelete = await prisma.newArrival.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!itemToDelete) {
      return { success: false, error: "Item not found." };
    }

    // Delete from database
    await prisma.newArrival.delete({ where: { id } });

    // Delete image from Vercel Blob Storage
    if (itemToDelete.imageUrl) {
      try {
        await del(itemToDelete.imageUrl);
        console.log(`Deleted blob: ${itemToDelete.imageUrl}`);
      } catch (blobError) {
        console.error(
          `Failed to delete blob ${itemToDelete.imageUrl}:`,
          blobError,
        );
        // Continue even if blob deletion fails, but log it
      }
    }

    return { success: true, data: { id } }; // Indicate success
  } catch (error) {
    console.error("Error deleting new arrival:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// --- Update Action ---
export async function updateNewArrival(
  id: string,
  formData: FormData,
): Promise<NewArrivalResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    // Validate user
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    // Get form data
    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const ratingStr = formData.get("rating") as string;
    const file = formData.get("image") as File | null; // Image is optional

    // Basic validation
    if (!name) throw new Error("Product name is required");
    const price = parseFloat(priceStr);
    const rating = parseInt(ratingStr);
    if (isNaN(price) || price <= 0) throw new Error("Valid price is required");
    if (isNaN(rating) || rating < 1 || rating > 5)
      throw new Error("Rating must be 1-5");

    let imageUrl: string | undefined;
    let oldImageUrl: string | null = null;

    // Find existing item to check for old image
    const existingItem = await prisma.newArrival.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!existingItem) return { success: false, error: "Item not found." };
    oldImageUrl = existingItem.imageUrl;

    // Handle image upload only if a new file is provided
    if (file && file.size > 0) {
      // Validate new image
      if (!ALLOWED_IMAGE_TYPES.includes(file.type))
        throw new Error("Invalid image type.");
      if (file.size > MAX_IMAGE_SIZE) throw new Error("Image size too large.");

      // Upload new image
      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `new-arrivals/product_${id}_${timestamp}.${fileExt}`; // Use item ID
      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });
      if (!blob.url) throw new Error("Failed to upload new image.");
      imageUrl = blob.url;
      console.log(`Uploaded new image: ${imageUrl}`);

      // Delete OLD image from Vercel Blob AFTER successful upload & BEFORE DB update
      if (oldImageUrl && oldImageUrl !== imageUrl) {
        try {
          await del(oldImageUrl);
          console.log(`Deleted old blob: ${oldImageUrl}`);
        } catch (blobError) {
          console.error(`Failed to delete old blob ${oldImageUrl}:`, blobError);
        }
      }
    }

    // Prepare data for DB update
    const dataToUpdate: Prisma.NewArrivalUpdateInput = {
      name,
      price,
      rating,
      ...(imageUrl && { imageUrl }), // Conditionally update imageUrl
    };

    // Update database
    const updatedItem = await prisma.newArrival.update({
      where: { id },
      data: dataToUpdate,
      include: { user: { select: { displayName: true } } }, // Include user data
    });

    return { success: true, data: updatedItem }; // Return updated item
  } catch (error) {
    console.error(`Error updating new arrival ${id}:`, error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

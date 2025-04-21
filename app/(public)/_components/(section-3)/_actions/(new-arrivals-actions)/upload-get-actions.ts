// app/(public)/_components/(section-3)/_actions/(new-arrivals-actions)/upload-get-actions.ts
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

// Response type (can be reused or made generic)
interface NewArrivalResponse {
  success: boolean;
  data?: any; // Consider defining a more specific type based on Prisma model
  error?: string;
}

// Create action
export async function createNewArrival(
  formData: FormData,
): Promise<NewArrivalResponse> {
  try {
    // Validate user
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") throw new Error("Unauthorized access");

    // Get form data
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const ratingStr = formData.get("rating") as string;

    // Validate inputs
    if (!file || !file.size) throw new Error("Image file is required");
    if (!name) throw new Error("Product name is required");
    const price = parseFloat(priceStr);
    const rating = parseInt(ratingStr);
    if (isNaN(price) || price <= 0) throw new Error("Valid price is required");
    if (isNaN(rating) || rating < 1 || rating > 5)
      throw new Error("Rating must be between 1 and 5");

    // Validate image
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      throw new Error("Invalid image type");
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Image size exceeds 6MB");

    // Upload image
    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `new-arrivals/product_${user.id}_${timestamp}.${fileExt}`;
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });
    if (!blob.url) throw new Error("Failed to upload image");

    // Create DB record
    const newArrival = await prisma.newArrival.create({
      data: {
        name,
        price,
        rating,
        imageUrl: blob.url,
        userId: user.id,
      },
      include: { user: { select: { displayName: true } } }, // Include user for immediate use
    });

    return { success: true, data: newArrival };
  } catch (error) {
    console.error("Error creating new arrival:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// Get all new arrivals
export async function getNewArrivals(): Promise<NewArrivalResponse> {
  try {
    const items = await prisma.newArrival.findMany({
      orderBy: { createdAt: "asc" },
      include: { user: { select: { displayName: true } } },
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// Get single new arrival by ID
export async function getNewArrivalById(
  id: string,
): Promise<NewArrivalResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  try {
    const newArrival = await prisma.newArrival.findUnique({
      where: { id },
      include: { user: { select: { displayName: true } } },
    });
    if (!newArrival) {
      return { success: false, error: "New arrival not found" };
    }
    return { success: true, data: newArrival };
  } catch (error) {
    console.error(`Error fetching new arrival ${id}:`, error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// app/(public)/_components/(section-3)/_actions/(best-seller-actions)/upload-get-actions.ts
"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation"; // Keep if used, otherwise remove
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma types if needed for error handling

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

// Response type
interface BestSellerResponse {
  success: boolean;
  data?: any; // Consider specific Prisma type like Prisma.BestSellerGetPayload<...>
  error?: string;
}

// Create action
export async function createBestSeller(
  formData: FormData,
): Promise<BestSellerResponse> {
  try {
    const { user } = await validateRequest();
    if (!user || user.role !== "EDITOR") {
      // Throwing an error here is better for server actions usually
      // Alternatively, return { success: false, error: "Unauthorized access" };
      throw new Error("Unauthorized access");
    }

    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const ratingStr = formData.get("rating") as string;

    // --- Refined Validation ---
    if (!file || !file.size)
      return { success: false, error: "Image file is required" };
    if (!name) return { success: false, error: "Product name is required" };
    const price = parseFloat(priceStr);
    const rating = parseInt(ratingStr);
    if (isNaN(price) || price <= 0)
      return { success: false, error: "Valid price is required" };
    if (isNaN(rating) || rating < 1 || rating > 5)
      return { success: false, error: "Rating must be 1-5" };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      return { success: false, error: "Invalid image type" };
    if (file.size > MAX_IMAGE_SIZE)
      return { success: false, error: "Image size exceeds 6MB" };
    // --- End Validation ---

    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `best-seller/product_${user.id}_${timestamp}.${fileExt}`; // Use user ID for folder structure maybe?
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });
    if (!blob.url) return { success: false, error: "Failed to upload image" }; // Return error response

    const bestSeller = await prisma.bestSeller.create({
      data: { name, price, rating, imageUrl: blob.url, userId: user.id },
      include: { user: { select: { displayName: true } } }, // Include necessary relations
    });

    return { success: true, data: bestSeller };
  } catch (error) {
    console.error("Error creating best seller:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    // --- Ensure catch block returns the correct type ---
    return { success: false, error: message };
  }
}

// Get all best sellers
export async function getBestSeller(): Promise<BestSellerResponse> {
  console.log("[Action:getBestSeller] Fetching all best sellers...");
  try {
    const items = await prisma.bestSeller.findMany({
      orderBy: { createdAt: "asc" },
      include: { user: { select: { displayName: true } } },
    });
    console.log(`[Action:getBestSeller] Found ${items.length} items in DB.`);
    return { success: true, data: items };
  } catch (error) {
    console.error("[Action:getBestSeller] Error fetching best sellers:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    // --- Ensure catch block returns the correct type ---
    return { success: false, error: message };
  }
}

// Get single best seller by ID
export async function getBestSellerById(
  id: string,
): Promise<BestSellerResponse> {
  if (!id) return { success: false, error: "Item ID is required" };
  console.log(`[Action:getBestSellerById] Fetching item ${id}...`); // Added log
  try {
    const bestSeller = await prisma.bestSeller.findUnique({
      where: { id },
      include: { user: { select: { displayName: true } } },
    });
    if (!bestSeller) {
      console.log(`[Action:getBestSellerById] Item ${id} not found.`);
      return { success: false, error: "Best seller not found" }; // Return error response
    }
    console.log(`[Action:getBestSellerById] Found item ${id}.`);
    return { success: true, data: bestSeller };
  } catch (error) {
    console.error(
      `[Action:getBestSellerById] Error fetching best seller ${id}:`,
      error,
    );
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    // --- Ensure catch block returns the correct type ---
    return { success: false, error: message };
  }
}

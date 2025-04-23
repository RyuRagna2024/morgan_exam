// app/(public)/(group-products)/_actions/bannerManagementActions.ts

"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { UserRole, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob"; // Import put and del

// --- Keep Delete Result Type ---
interface DeleteBannerResult {
  success: boolean;
  message?: string;
  error?: string;
}

// --- Updated Upsert Result Type (includes new URL) ---
interface UpsertBannerResult {
  success: boolean;
  message?: string;
  error?: string;
  newImageUrl?: string; // Return the URL of the uploaded image
}

// Allowed image types and size (consider putting in a shared constants file)
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB

/**
 * Creates or updates a collection banner by uploading an image.
 * Requires EDITOR role.
 * @param category - The category identifier (e.g., 'headwear').
 * @param formData - FormData containing the 'image' file.
 */
export async function upsertCollectionBanner(
  category: string,
  formData: FormData,
): Promise<UpsertBannerResult> {
  const normalizedCategory = category.toLowerCase();
  const file = formData.get("image") as File | null;

  if (!normalizedCategory) {
    return { success: false, error: "Category is required." };
  }
  // Image is required for this action now
  if (!file || file.size === 0) {
    return { success: false, error: "An image file is required." };
  }

  // --- File Validation ---
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid image type. Allowed: JPG, PNG, WEBP, GIF",
    };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      success: false,
      error: `Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }
  // --- End File Validation ---

  try {
    const { user } = await validateRequest();
    if (!user || user.role !== UserRole.EDITOR) {
      return {
        success: false,
        error: "Unauthorized: Only editors can update banners.",
      };
    }

    console.log(
      `Editor ${user.id} upserting banner via upload for category: ${normalizedCategory}`,
    );

    // --- Get old image URL for deletion later ---
    const existingBanner = await prisma.collectionBanner.findUnique({
      where: { category: normalizedCategory },
      select: { imageUrl: true },
    });
    const oldImageUrl = existingBanner?.imageUrl;
    // --- End Get old image URL ---

    // --- Upload new image to Vercel Blob ---
    const fileExt = file.name.split(".").pop() || "png"; // Default extension
    const timestamp = Date.now();
    // Construct a unique path, e.g., banners/category/editorId_timestamp.ext
    const blobPath = `banners/${normalizedCategory}/${user.id}_${timestamp}.${fileExt}`;

    console.log(`Uploading to blob path: ${blobPath}`);
    const blob = await put(blobPath, file, {
      access: "public", // Make it publicly accessible
      addRandomSuffix: false, // Use our defined path
    });

    if (!blob?.url) {
      throw new Error(
        "Image upload failed. Could not get URL from blob storage.",
      );
    }
    const newImageUrl = blob.url;
    console.log(`Blob upload successful: ${newImageUrl}`);
    // --- End Upload ---

    // --- Upsert database record ---
    await prisma.collectionBanner.upsert({
      where: { category: normalizedCategory },
      update: { imageUrl: newImageUrl, editorId: user.id },
      create: {
        category: normalizedCategory,
        imageUrl: newImageUrl,
        editorId: user.id,
      },
    });
    console.log(`Database record upserted for ${normalizedCategory}.`);
    // --- End DB Upsert ---

    // --- Delete old blob image *after* DB update ---
    if (oldImageUrl && oldImageUrl !== newImageUrl) {
      try {
        console.log(`Deleting old blob: ${oldImageUrl}`);
        await del(oldImageUrl); // Pass the full URL to del
        console.log(`Old blob deleted successfully.`);
      } catch (delError) {
        // Log error but don't fail the whole operation
        console.error(`Failed to delete old blob ${oldImageUrl}:`, delError);
      }
    }
    // --- End Delete old blob ---

    // Revalidate public path
    const publicPath = `/${normalizedCategory === "all-collections" ? "all-collections" : normalizedCategory}`;
    revalidatePath(publicPath);
    console.log(`Revalidated public path: ${publicPath}`);

    return {
      success: true,
      message: `Banner for ${normalizedCategory} updated successfully.`,
      newImageUrl: newImageUrl, // Return the new URL
    };
  } catch (error) {
    console.error(`Error upserting banner for ${normalizedCategory}:`, error);
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to update banner: ${error.message}`,
      };
    }
    return {
      success: false,
      error: "Failed to update banner due to an unexpected error.",
    };
  }
}

// --- Keep deleteCollectionBanner function as previously defined ---
export async function deleteCollectionBanner(
  category: string,
): Promise<DeleteBannerResult> {
  // ... (keep the existing delete function code) ...
  const normalizedCategory = category.toLowerCase();
  if (!normalizedCategory)
    return { success: false, error: "Category is required." };

  try {
    const { user } = await validateRequest();
    if (!user || user.role !== UserRole.EDITOR)
      return { success: false, error: "Unauthorized" };

    const bannerToDelete = await prisma.collectionBanner.findUnique({
      where: { category: normalizedCategory },
      select: { imageUrl: true },
    });

    // Delete DB record first
    await prisma.collectionBanner.delete({
      where: { category: normalizedCategory },
    });
    console.log(`DB record for ${normalizedCategory} banner deleted.`);

    // Attempt to delete blob if URL existed
    if (bannerToDelete?.imageUrl) {
      try {
        console.log(`Attempting to delete blob: ${bannerToDelete.imageUrl}`);
        await del(bannerToDelete.imageUrl);
        console.log(`Blob deleted successfully.`);
      } catch (delError) {
        console.error(
          `Failed to delete blob ${bannerToDelete.imageUrl}:`,
          delError,
        );
        // Don't fail the whole operation, just log it
      }
    }

    const publicPath = `/${normalizedCategory === "all-collections" ? "all-collections" : normalizedCategory}`;
    revalidatePath(publicPath);

    return {
      success: true,
      message: `Banner for ${normalizedCategory} deleted.`,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: true,
        message: `Banner for ${normalizedCategory} already removed.`,
      };
    }
    console.error(`Error deleting banner for ${normalizedCategory}:`, error);
    if (error instanceof Error)
      return { success: false, error: `Delete failed: ${error.message}` };
    return { success: false, error: "Unexpected error deleting banner." };
  }
}

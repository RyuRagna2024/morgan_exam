"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// Define allowed image types and max size
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export type UploadAvatarResponse = {
  success: boolean;
  avatarUrl?: string;
  error?: string;
};

export async function uploadAvatar(
  formData: FormData,
): Promise<UploadAvatarResponse> {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");

    // Get form data
    const file = formData.get("avatar") as File;

    // Validate file presence
    if (!file || !file.size) throw new Error("No avatar image provided");

    // Validate image type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      throw new Error(
        "Invalid file type. Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF",
      );
    }

    // Validate image size
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("File size must be less than 5MB");
    }

    // Upload image to blob storage
    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `avatars/user_${user.id}_${timestamp}.${fileExt}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    if (!blob.url) throw new Error("Failed to get URL from blob storage");

    // Update user's avatarUrl in the database
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl: blob.url,
      },
    });

    return {
      success: true,
      avatarUrl: blob.url,
    };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

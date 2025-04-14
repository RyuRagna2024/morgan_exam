// src/app/(customer)/_components/(sidebar)/_profile-actions/upload-avatar.ts
// (Adjust path if needed)

"use server";

import { validateRequest } from "@/auth";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";

// Define response type (remains the same)
export type UploadAvatarResponse = {
  success: boolean;
  avatarUrl?: string | null; // Make them optional/nullable as they might not be updated
  backgroundUrl?: string | null;
  error?: string;
};

// Define image constants (remains the same)
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_SIZE = 1024 * 1024 * 5; // 5MB

export async function uploadAvatar(
  formData: FormData,
): Promise<UploadAvatarResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { success: false, error: "Unauthorized access" }; // Return error object
    }

    const avatarFile = formData.get("avatar") as File | null; // Can be null
    const backgroundFile = formData.get("background") as File | null; // Can be null

    // --- VALIDATION: Check if at least one file was provided ---
    const hasAvatar = avatarFile && avatarFile.size > 0;
    const hasBackground = backgroundFile && backgroundFile.size > 0;

    if (!hasAvatar && !hasBackground) {
      // Throw error only if NEITHER file is present
      return {
        success: false,
        error: "No avatar or background file provided.",
      };
    }

    let uploadedAvatarUrl: string | undefined = undefined;
    let uploadedBackgroundUrl: string | undefined = undefined;

    // --- Process Avatar IF Provided ---
    if (hasAvatar && avatarFile) {
      // Added avatarFile check for type safety
      // Validate avatar file
      if (!ALLOWED_IMAGE_TYPES.includes(avatarFile.type)) {
        return { success: false, error: "Invalid avatar image type" };
      }
      if (avatarFile.size > MAX_IMAGE_SIZE) {
        return { success: false, error: "Avatar image too large (Max 5MB)" };
      }

      // Upload avatar
      const avatarExt = avatarFile.name.split(".").pop() || "jpg";
      const avatarPath = `avatars/user_${user.id}_avatar_${Date.now()}.${avatarExt}`;

      const avatarBlob = await put(avatarPath, avatarFile, {
        access: "public",
        addRandomSuffix: false, // Consider adding random suffix for cache busting if needed
      });
      uploadedAvatarUrl = avatarBlob.url; // Store the URL
    }

    // --- Process Background IF Provided ---
    if (hasBackground && backgroundFile) {
      // Added backgroundFile check for type safety
      // Validate background file
      if (!ALLOWED_IMAGE_TYPES.includes(backgroundFile.type)) {
        return { success: false, error: "Invalid background image type" };
      }
      if (backgroundFile.size > MAX_IMAGE_SIZE) {
        return {
          success: false,
          error: "Background image too large (Max 5MB)",
        };
      }

      // Upload background
      const bgExt = backgroundFile.name.split(".").pop() || "jpg";
      const bgPath = `backgrounds/user_${user.id}_bg_${Date.now()}.${bgExt}`;

      const bgBlob = await put(bgPath, backgroundFile, {
        access: "public",
        addRandomSuffix: false, // Consider adding random suffix
      });
      uploadedBackgroundUrl = bgBlob.url; // Store the URL
    }

    // --- Update Database Conditionally ---
    // Prepare data object - only include fields that have new URLs
    const dataToUpdate: { avatarUrl?: string; backgroundUrl?: string } = {};
    if (uploadedAvatarUrl !== undefined) {
      dataToUpdate.avatarUrl = uploadedAvatarUrl;
    }
    if (uploadedBackgroundUrl !== undefined) {
      dataToUpdate.backgroundUrl = uploadedBackgroundUrl;
    }

    // Update only if there's something to update
    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate, // Use the conditionally prepared data object
      });
    } else {
      // This case shouldn't be reachable due to the initial check, but good practice
      console.warn("Upload action called but no valid files processed.");
      // Optionally return an error or specific message here
    }

    // --- Return Success Response ---
    // Return the URLs that were actually processed/updated
    return {
      success: true,
      // Return null if not updated, or the new URL if updated
      avatarUrl:
        uploadedAvatarUrl !== undefined ? uploadedAvatarUrl : user.avatarUrl,
      backgroundUrl:
        uploadedBackgroundUrl !== undefined
          ? uploadedBackgroundUrl
          : user.backgroundUrl,
    };
  } catch (error) {
    console.error("Upload Avatar Action Error:", error); // Log the detailed error server-side
    return {
      success: false,
      // Provide a generic error message to the client
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during upload.",
    };
  }
}

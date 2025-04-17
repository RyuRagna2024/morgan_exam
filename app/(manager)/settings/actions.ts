// app/(manager)/settings/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
// import { profileUpdateSchema } from "../_components/profile/types"; // Keep if using profile info form later

// --- ADD Vercel Blob ---
import { put } from "@vercel/blob";
import { UserRole } from "@prisma/client"; // Import UserRole if checking

// --- Action to update basic profile info (Keep if needed elsewhere) ---
// export async function updateManagerProfileInfo(...) { ... }

// --- Action to handle BOTH Avatar & Background Uploads ---
// Define image constants
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_SIZE = 1024 * 1024 * 5; // 5MB

export async function uploadManagerImages(formData: FormData): Promise<{
  success: boolean; // Make success non-optional
  error?: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
}> {
  const { user } = await validateRequest();
  // Refined check: Ensure user exists and has MANAGER role
  if (!user || user.role !== UserRole.MANAGER) {
    return { success: false, error: "Unauthorized" };
  }

  const avatarFile = formData.get("avatar") as File | null;
  const backgroundFile = formData.get("background") as File | null;

  const hasAvatar = avatarFile && avatarFile.size > 0;
  const hasBackground = backgroundFile && backgroundFile.size > 0;

  if (!hasAvatar && !hasBackground) {
    return { success: false, error: "No image file provided." };
  }

  let uploadedAvatarUrl: string | undefined = undefined;
  let uploadedBackgroundUrl: string | undefined = undefined;

  try {
    // --- Process Avatar IF Provided ---
    if (hasAvatar && avatarFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(avatarFile.type)) {
        return { success: false, error: "Invalid avatar image type" };
      }
      if (avatarFile.size > MAX_IMAGE_SIZE) {
        return { success: false, error: "Avatar image too large (Max 5MB)" };
      }
      const avatarExt = avatarFile.name.split(".").pop() || "jpg";
      // Use a distinct path for managers
      const avatarPath = `manager-avatars/user_${user.id}_avatar_${Date.now()}.${avatarExt}`;
      const avatarBlob = await put(avatarPath, avatarFile, {
        access: "public",
      });
      uploadedAvatarUrl = avatarBlob.url;
    }

    // --- Process Background IF Provided ---
    if (hasBackground && backgroundFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(backgroundFile.type)) {
        return { success: false, error: "Invalid background image type" };
      }
      if (backgroundFile.size > MAX_IMAGE_SIZE) {
        return {
          success: false,
          error: "Background image too large (Max 5MB)",
        };
      }
      const bgExt = backgroundFile.name.split(".").pop() || "jpg";
      // Use a distinct path for managers
      const bgPath = `manager-backgrounds/user_${user.id}_bg_${Date.now()}.${bgExt}`;
      const bgBlob = await put(bgPath, backgroundFile, { access: "public" });
      uploadedBackgroundUrl = bgBlob.url;
    }

    // --- Update Database Conditionally ---
    const dataToUpdate: { avatarUrl?: string; backgroundUrl?: string } = {};
    if (uploadedAvatarUrl !== undefined)
      dataToUpdate.avatarUrl = uploadedAvatarUrl;
    if (uploadedBackgroundUrl !== undefined)
      dataToUpdate.backgroundUrl = uploadedBackgroundUrl;

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate,
      });
    }

    // --- Revalidation ---
    revalidatePath("/manager", "layout"); // Revalidate layout to update server components potentially using user data
    // revalidatePath("/manager/settings"); // Keep if settings page uses this data

    // --- Return Success Response ---
    // Return the new URLs if they were uploaded, otherwise return the user's *existing* URLs
    // This helps the client update state correctly.
    return {
      success: true,
      avatarUrl:
        uploadedAvatarUrl !== undefined ? uploadedAvatarUrl : user.avatarUrl,
      backgroundUrl:
        uploadedBackgroundUrl !== undefined
          ? uploadedBackgroundUrl
          : user.backgroundUrl,
    };
  } catch (error) {
    console.error("Manager Image upload action error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload image(s).",
    };
  }
}

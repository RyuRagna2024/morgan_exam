// app/(manager)/settings/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { profileUpdateSchema } from "../_components/profile/types"; // Correct path

// --- Action to update basic profile info ---
export async function updateManagerProfileInfo(
  values: z.infer<typeof profileUpdateSchema>,
): Promise<{ success?: string; error?: string }> {
  const { user } = await validateRequest();
  if (!user || user.role !== "MANAGER") {
    // Extra role check
    return { error: "Unauthorized" };
  }

  try {
    const validatedData = profileUpdateSchema.parse(values);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName,
      },
    });

    revalidatePath("/manager/settings");
    revalidatePath("/manager", "layout"); // Revalidate layout using manager data
    return { success: "Profile details updated!" };
  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof z.ZodError) return { error: "Invalid data." };
    return { error: "Failed to update profile details." };
  }
}

// --- Action to handle BOTH Avatar & Background Uploads ---
// Mimics the customer action 'uploadAvatar' based on the form structure
export async function uploadManagerImages(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
  avatarUrl?: string | null; // Return new URL if uploaded
  backgroundUrl?: string | null; // Return new URL if uploaded
}> {
  const { user } = await validateRequest();
  if (!user || user.role !== "MANAGER") {
    return { error: "Unauthorized", success: false };
  }

  const avatarFile = formData.get("avatar") as File | null;
  const backgroundFile = formData.get("background") as File | null;

  let newAvatarUrl: string | null = null;
  let newBackgroundUrl: string | null = null;

  try {
    // --- !!! VITAL: Replace with your actual Cloud Storage Upload Logic !!! ---

    if (avatarFile && avatarFile.size > 0) {
      console.log(
        `TODO: Upload avatar file: ${avatarFile.name} for user ${user.id}`,
      );
      // Example: const uploadedAvatar = await uploadToCloudStorage(avatarFile, `manager-avatars/${user.id}`);
      // newAvatarUrl = uploadedAvatar.url;
      newAvatarUrl = `https://picsum.photos/seed/avatar${Date.now()}/200`; // FAKE URL
      console.warn("Using FAKE avatar upload URL!");
    }

    if (backgroundFile && backgroundFile.size > 0) {
      console.log(
        `TODO: Upload background file: ${backgroundFile.name} for user ${user.id}`,
      );
      // Example: const uploadedBackground = await uploadToCloudStorage(backgroundFile, `manager-backgrounds/${user.id}`);
      // newBackgroundUrl = uploadedBackground.url;
      newBackgroundUrl = `https://picsum.photos/seed/bg${Date.now()}/800/200`; // FAKE URL
      console.warn("Using FAKE background upload URL!");
    }
    // --- End Upload Logic ---

    // Update database only if new URLs were generated
    const dataToUpdate: { avatarUrl?: string; backgroundUrl?: string } = {};
    if (newAvatarUrl) dataToUpdate.avatarUrl = newAvatarUrl;
    if (newBackgroundUrl) dataToUpdate.backgroundUrl = newBackgroundUrl;

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate,
      });
    }

    revalidatePath("/manager/settings");
    revalidatePath("/manager", "layout"); // Revalidate layout potentially using user data

    return {
      success: true,
      avatarUrl: newAvatarUrl, // Return the newly generated URL (or null)
      backgroundUrl: newBackgroundUrl, // Return the newly generated URL (or null)
    };
  } catch (error) {
    console.error("Image upload action error:", error);
    return { error: "Failed to upload image(s).", success: false };
  }
}

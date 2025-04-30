// app/(customer)/settings/_actions/actions.ts
"use server";

import { z } from "zod";
import { validateRequest } from "@/auth"; // Adjust path if needed
import prisma from "@/lib/prisma"; // Adjust path if needed
import { verify, hash } from "@node-rs/argon2";
import { revalidatePath } from "next/cache";
import type { UserCheckoutPreference } from "@prisma/client";

// Import types (ProfileUpdateActionResult defined below)
import {
  ProfileUpdateFormValues,
  profileUpdateSchema,
  CheckoutPreferenceFormValues,
  checkoutPreferenceSchema,
  PasswordChangeFormValues,
  passwordChangeSchema,
  PasswordChangeResult,
  UpdateActionResult,
} from "./types"; // Adjust path if needed

// Export ProfileUpdateActionResult if needed elsewhere
export interface ProfileUpdateActionResult extends UpdateActionResult {
  updatedUser?: Partial<ProfileUpdateFormValues>;
}

// === Action to GET Checkout Preferences ===
export async function getCheckoutPreferences(): Promise<{
  preference: UserCheckoutPreference | null;
  error?: string;
}> {
  // console.log("[Action] getCheckoutPreferences: Fetching..."); // Optional: Keep if helpful
  try {
    const { user } = await validateRequest();
    if (!user) return { preference: null, error: "User not authenticated." };
    const preference = await prisma.userCheckoutPreference.findUnique({
      where: { userId: user.id },
    });
    return { preference };
  } catch (error) {
    console.error("[Action] getCheckoutPreferences: Error:", error);
    return { preference: null, error: "Failed to load checkout preferences." };
  }
}

// === Action to UPDATE Checkout Preferences ===
export async function updateCheckoutPreferences(
  formData: CheckoutPreferenceFormValues,
): Promise<UpdateActionResult> {
  // console.log("[Action] updateCheckoutPreferences: Updating..."); // Optional: Keep if helpful
  try {
    const { user } = await validateRequest();
    if (!user) return { error: "User not authenticated." };
    const validationResult = checkoutPreferenceSchema.safeParse(formData);
    if (!validationResult.success) return { error: "Invalid data submitted." };
    const validatedData = validationResult.data;
    const dataToSave = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ]),
    );
    await prisma.userCheckoutPreference.upsert({
      where: { userId: user.id },
      update: dataToSave,
      create: { userId: user.id, ...dataToSave },
    });
    revalidatePath("/settings");
    revalidatePath("/checkout");
    return { success: "Checkout preferences updated successfully." };
  } catch (error: any) {
    console.error("[Action] updateCheckoutPreferences: Error:", error);
    if (error.code === "P2002") {
      return { error: "Conflict saving preferences." };
    }
    return { error: "Server error updating preferences." };
  }
}

// === Action to UPDATE Customer Profile Info ===
export async function updateCustomerProfileInfo(
  formData: ProfileUpdateFormValues,
): Promise<ProfileUpdateActionResult> {
  // console.log("[Action] updateCustomerProfileInfo called"); // Optional: Keep if helpful
  try {
    const { user } = await validateRequest();
    if (!user) return { error: "User not authenticated." };
    const validationResult = profileUpdateSchema.safeParse(formData);
    if (!validationResult.success) return { error: "Invalid data submitted." };
    const validatedData = validationResult.data;
    const updatedDbUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        /* Map fields */ firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName,
        username: validatedData.username,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber ?? "",
        country: validatedData.country,
        postcode: validatedData.postcode,
        streetAddress: validatedData.streetAddress ?? "",
        suburb: validatedData.suburb ?? null,
        townCity: validatedData.townCity ?? "",
      },
      select: {
        /* Select fields */ firstName: true,
        lastName: true,
        displayName: true,
        username: true,
        email: true,
        phoneNumber: true,
        country: true,
        postcode: true,
        streetAddress: true,
        suburb: true,
        townCity: true,
      },
    });
    revalidatePath("/settings");
    revalidatePath("/(customer)", "layout");
    return {
      success: "Profile information updated successfully.",
      updatedUser: updatedDbUser,
    };
  } catch (error: any) {
    /* ... Error Handling ... */
    console.error("[Action] updateCustomerProfileInfo Error:", error);
    // Handle unique constraints etc.
    return { error: "Failed to update profile information." };
  }
}

// === Action to CHANGE Password (NO SENSITIVE LOGS) ===
export async function changePassword(
  formData: PasswordChangeFormValues,
): Promise<PasswordChangeResult> {
  // Sensitive logs REMOVED
  // console.log("[Action] changePassword initiated."); // Optional: Keep non-sensitive
  try {
    const { user } = await validateRequest();
    if (!user) return { success: false, error: "User not authenticated." };

    const validationResult = passwordChangeSchema.safeParse(formData);
    if (!validationResult.success) {
      console.warn("[Action] changePassword: Zod validation failed."); // Okay to log event
      const fieldErrors = validationResult.error.flatten()
        .fieldErrors as PasswordChangeResult["fieldErrors"];
      const formErrors = validationResult.error.flatten().formErrors;
      const specificError =
        fieldErrors?.confirmNewPassword ||
        (formErrors.length > 0 ? formErrors[0] : "Invalid input.");
      return { success: false, error: specificError, fieldErrors: fieldErrors };
    }
    const validatedData = validationResult.data;
    // Sensitive log REMOVED
    // console.log("[Action] changePassword: Data validated."); // Optional: Keep non-sensitive

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!dbUser || !dbUser.passwordHash) {
      console.error(
        "[Action] changePassword: Could not retrieve user data or hash.",
      );
      return { success: false, error: "Could not retrieve current user data." };
    }

    // Verify CURRENT password
    const validPassword = await verify(
      dbUser.passwordHash,
      validatedData.currentPassword,
    );
    if (!validPassword) {
      console.warn(
        "[Action] changePassword: Current password verification FAILED.",
      );
      return {
        success: false,
        error: "Incorrect current password.",
        fieldErrors: { currentPassword: "Incorrect current password." },
      };
    }
    // console.log("[Action] changePassword: Current password verified."); // Optional: Keep non-sensitive

    // Hash the NEW password
    const newPasswordHash = await hash(validatedData.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Update DB with the NEW hash
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });
    console.log("[Action] changePassword: Password hash updated in DB."); // Okay non-sensitive log

    revalidatePath("/(customer)", "layout");
    return { success: true, message: "Password updated successfully." };
  } catch (error: any) {
    console.error("[Action] changePassword: Uncaught Error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Schema validation failed unexpectedly.",
      };
    }
    return { success: false, error: "An unexpected server error occurred." };
  }
}

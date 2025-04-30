// app/(customer)/settings/_actions/actions.ts
"use server";

import { z } from "zod";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { verify, hash } from "@node-rs/argon2";
import { revalidatePath } from "next/cache";
import type { UserCheckoutPreference } from "@prisma/client"; // Import the model type

// Import types using the correct names
import {
  ProfileUpdateFormValues,
  profileUpdateSchema,
  CheckoutPreferenceFormValues, // Use correct name
  checkoutPreferenceSchema, // Use correct name
  PasswordChangeFormValues,
  passwordChangeSchema,
  PasswordChangeResult,
  UpdateActionResult,
  // ProfileUpdateActionResult defined and exported below
} from "./types";

// --- <<< Export added here >>> ---
export interface ProfileUpdateActionResult extends UpdateActionResult {
  updatedUser?: Partial<ProfileUpdateFormValues>; // Send back relevant updated fields
}

// --- Action to GET Checkout Preferences ---
export async function getCheckoutPreferences(): Promise<{
  preference: UserCheckoutPreference | null;
  error?: string;
}> {
  console.log("[Action] getCheckoutPreferences: Fetching...");
  try {
    const { user } = await validateRequest();
    if (!user) {
      console.warn("[Action] getCheckoutPreferences: Not authenticated.");
      return { preference: null, error: "User not authenticated." };
    }

    const preference = await prisma.userCheckoutPreference.findUnique({
      where: { userId: user.id },
    });
    console.log("[Action] getCheckoutPreferences: Found:", !!preference);
    return { preference };
  } catch (error) {
    console.error("[Action] getCheckoutPreferences: Error:", error);
    return { preference: null, error: "Failed to load checkout preferences." };
  }
}

// --- Action to UPDATE Checkout Preferences ---
export async function updateCheckoutPreferences(
  formData: CheckoutPreferenceFormValues, // Use the correct type
): Promise<UpdateActionResult> {
  console.log("[Action] updateCheckoutPreferences: Updating...");
  try {
    // 1. Validate Auth
    const { user } = await validateRequest();
    if (!user) {
      console.warn("[Action] updateCheckoutPreferences: Not authenticated.");
      return { error: "User not authenticated." };
    }

    // 2. Validate Data
    const validationResult = checkoutPreferenceSchema.safeParse(formData); // Use the preference schema
    if (!validationResult.success) {
      console.warn(
        "[Action] updateCheckoutPreferences: Validation failed:",
        validationResult.error.flatten(),
      );
      return { error: "Invalid data submitted." };
    }
    // Convert empty strings back to null for optional fields
    const validatedData = validationResult.data;
    const dataToSave = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ]),
    );
    console.log(
      "[Action] updateCheckoutPreferences: Data validated and prepared:",
      dataToSave,
    );

    // 3. Upsert Preferences
    await prisma.userCheckoutPreference.upsert({
      where: { userId: user.id },
      update: dataToSave, // Fields to update
      create: {
        userId: user.id,
        ...dataToSave, // Fields to set on creation
      },
    });
    console.log(
      `[Action] updateCheckoutPreferences: Upserted successfully for user ${user.id}.`,
    );

    // 4. Revalidate Cache
    revalidatePath("/settings");
    revalidatePath("/checkout");

    // 5. Return Success
    return { success: "Checkout preferences updated successfully." };
  } catch (error: any) {
    console.error("[Action] updateCheckoutPreferences: Error:", error);
    if (error.code === "P2002") {
      return { error: "A conflict occurred while saving preferences." };
    }
    return {
      error: "Failed to update checkout preferences due to a server error.",
    };
  }
}

// --- updateCustomerProfileInfo Action ---
export async function updateCustomerProfileInfo(
  formData: ProfileUpdateFormValues,
): Promise<ProfileUpdateActionResult> {
  // Uses the exported interface
  console.log("[Action] updateCustomerProfileInfo called");
  try {
    const { user } = await validateRequest();
    if (!user) return { error: "User not authenticated." };
    const validationResult = profileUpdateSchema.safeParse(formData);
    if (!validationResult.success) return { error: "Invalid data submitted." };
    const validatedData = validationResult.data;
    const updatedDbUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
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
        firstName: true,
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
    console.error("[Action] updateCustomerProfileInfo Error:", error);
    // Handle potential Prisma errors (e.g., unique constraint violation)
    if (error.code === "P2002") {
      const target = error.meta?.target as string[] | undefined; // Prisma provides info on which field failed
      if (target && target.includes("email")) {
        return { error: "This email address is already in use." };
      } else if (target && target.includes("username")) {
        return { error: "This username is already taken." };
      }
      return { error: "A unique value conflict occurred." };
    }
    return { error: "Failed to update profile information." };
  }
}

// --- changePassword Action ---
export async function changePassword(
  formData: PasswordChangeFormValues,
): Promise<PasswordChangeResult> {
  console.log("[Action] changePassword called");
  try {
    const { user } = await validateRequest();
    if (!user) return { success: false, error: "User not authenticated." };
    const validationResult = passwordChangeSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten()
        .fieldErrors as Partial<Record<keyof PasswordChangeFormValues, string>>;
      const formErrors = validationResult.error.flatten().formErrors;
      const specificError =
        fieldErrors.confirmNewPassword ||
        (formErrors.length > 0 ? formErrors[0] : "Invalid input.");
      return { success: false, error: specificError, fieldErrors: fieldErrors };
    }
    const validatedData = validationResult.data;
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!dbUser || !dbUser.passwordHash)
      return { success: false, error: "Could not retrieve user data." };
    const validPassword = await verify(
      dbUser.passwordHash,
      validatedData.currentPassword,
    );
    if (!validPassword)
      return {
        success: false,
        error: "Incorrect current password.",
        fieldErrors: { currentPassword: "Incorrect current password." },
      };
    const newPasswordHash = await hash(validatedData.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });
    revalidatePath("/(customer)", "layout");
    return { success: true, message: "Password updated successfully." };
  } catch (error: any) {
    console.error("[Action] changePassword Error:", error);
    if (error instanceof z.ZodError) {
      // Should be caught by safeParse, but belt-and-suspenders
      return { success: false, error: "Input validation failed unexpectedly." };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

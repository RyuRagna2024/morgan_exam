// app/(customer)/settings/_actions/actions.ts

"use server";

import { z } from "zod";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
// --- Import verify and hash directly from @node-rs/argon2 ---
import { verify, hash } from "@node-rs/argon2";
// --- Removed oslo/password import ---
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

// Import all necessary types and schemas from the types file
import {
  ProfileUpdateFormValues,
  profileUpdateSchema,
  CheckoutDetailsFormValues,
  checkoutDetailsSchema,
  PasswordChangeFormValues,
  passwordChangeSchema,
  PasswordChangeResult,
  UpdateActionResult,
} from "./types";

// --- Placeholder for updateCustomerProfileInfo Action ---
export async function updateCustomerProfileInfo(
  formData: ProfileUpdateFormValues,
): Promise<UpdateActionResult> {
  // ... (your existing implementation or placeholder) ...
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "User not authenticated." };
    }
    // ... rest of the logic
    await prisma.user.update({
      where: { id: user.id },
      data: {
        /* ... */
      },
    });
    return { success: "Profile information updated successfully." };
  } catch (error) {
    // ... error handling
    return { error: "Failed to update profile information." };
  }
}

// --- Placeholder for updateCheckoutDetails Action ---
export async function updateCheckoutDetails(
  formData: CheckoutDetailsFormValues,
): Promise<UpdateActionResult> {
  // ... (your existing implementation or placeholder) ...
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "User not authenticated." };
    }
    // ... rest of the logic
    await prisma.user.update({
      where: { id: user.id },
      data: {
        /* ... */
      },
    });
    return { success: "Checkout details updated successfully." };
  } catch (error) {
    // ... error handling
    return { error: "Failed to update checkout details." };
  }
}

// --- Change Password Server Action ---
export async function changePassword(
  formData: PasswordChangeFormValues,
): Promise<PasswordChangeResult> {
  console.log("changePassword action initiated.");

  try {
    // 1. Validate Authentication
    const { user } = await validateRequest();
    if (!user) {
      console.warn("Password change attempt failed: User not authenticated.");
      return { success: false, error: "User not authenticated." };
    }
    console.log(`Authenticated user for password change: ${user.id}`);

    // 2. Validate Input Data
    const validatedData = passwordChangeSchema.parse(formData);
    console.log("Password change form data validated.");

    // 3. Fetch current user's password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser || !dbUser.passwordHash) {
      console.error(`Failed to retrieve password hash for user ${user.id}.`);
      return { success: false, error: "Could not retrieve current user data." };
    }

    // --- 4. Verify Current Password using @node-rs/argon2 ---
    console.log(
      `Verifying current password for user ${user.id} using @node-rs/argon2...`,
    );
    let validPassword = false;
    try {
      validPassword = await verify(
        dbUser.passwordHash,
        validatedData.currentPassword,
      );
    } catch (verifyError) {
      // @node-rs/argon2 throws an error if the hash format is invalid
      // or if verification otherwise fails unexpectedly.
      console.error(
        `Error verifying password for user ${user.id}:`,
        verifyError,
      );
      return {
        success: false,
        error: "Failed to verify current password. Please try again.", // More generic error
      };
    }

    if (!validPassword) {
      console.warn(`Incorrect current password entered for user ${user.id}.`);
      return {
        success: false,
        error: "Incorrect current password.",
        fieldErrors: { currentPassword: "Incorrect current password." },
      };
    }
    console.log("Current password verified successfully.");
    // --- End of verification change ---

    // --- 5. Hash the New Password using @node-rs/argon2 ---
    // Use the SAME parameters as in your registration action
    console.log("Hashing new password using @node-rs/argon2...");
    const newPasswordHash = await hash(validatedData.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    console.log("New password hashed.");
    // --- End of hashing change ---

    // 6. Update Password in Database
    console.log(`Updating password hash in DB for user ${user.id}...`);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });
    console.log(`Password updated successfully in DB for user ${user.id}.`);

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn(
        "Zod validation error during password change:",
        error.flatten(),
      );
      const refinementError = error.errors.find(
        (e) => e.code === "custom" && e.path.includes("confirmNewPassword"),
      );
      if (refinementError) {
        return {
          success: false,
          error: refinementError.message,
          fieldErrors: { confirmNewPassword: refinementError.message },
        };
      }
      const fieldErrors = error.flatten().fieldErrors as Partial<
        Record<keyof PasswordChangeFormValues, string>
      >;
      return {
        success: false,
        error: "Invalid input. Please check the fields.",
        fieldErrors: fieldErrors,
      };
    }
    console.error("Critical error changing password:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

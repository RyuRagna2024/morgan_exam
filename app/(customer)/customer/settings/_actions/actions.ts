// app/(customer)/settings/_actions/actions.ts

"use server";

import { z } from "zod";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { verify, hash } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // <<< Import revalidatePath

// Import all necessary types and schemas from the types file
import {
  ProfileUpdateFormValues,
  profileUpdateSchema,
  CheckoutDetailsFormValues,
  checkoutDetailsSchema,
  PasswordChangeFormValues,
  passwordChangeSchema,
  PasswordChangeResult,
  UpdateActionResult, // <<< We'll modify this slightly
} from "./types"; // Ensure this path is correct

// --- MODIFIED: Result type to potentially include updated data ---
// This helps update the client-side state without a full reload
export interface ProfileUpdateActionResult extends UpdateActionResult {
  updatedUser?: Partial<ProfileUpdateFormValues>; // Send back relevant updated fields
}

// --- COMPLETE updateCustomerProfileInfo Action ---
export async function updateCustomerProfileInfo(
  formData: ProfileUpdateFormValues,
): Promise<ProfileUpdateActionResult> {
  // <<< Use updated result type
  console.log("updateCustomerProfileInfo action started.");
  try {
    // 1. Validate Authentication
    const { user } = await validateRequest();
    if (!user) {
      console.warn("Profile update failed: User not authenticated.");
      return { error: "User not authenticated." };
    }
    console.log(`Authenticated user for profile update: ${user.id}`);

    // 2. Validate Input Data (Server-side)
    // Although zodResolver validates client-side, it's crucial for security
    // and data integrity to validate again on the server.
    const validationResult = profileUpdateSchema.safeParse(formData);
    if (!validationResult.success) {
      console.warn(
        "Server-side validation failed:",
        validationResult.error.flatten(),
      );
      // Consider returning field errors if needed, but a general error is often sufficient here
      return { error: "Invalid data submitted." };
    }
    const validatedData = validationResult.data;
    console.log("Server-side validation successful.");

    // 3. Update User in Database
    console.log(`Updating profile for user ${user.id}...`);
    const updatedDbUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName,
        username: validatedData.username, // Be cautious if allowing username changes due to uniqueness
        email: validatedData.email, // Be cautious if allowing email changes due to uniqueness and verification needs
        phoneNumber: validatedData.phoneNumber ?? "", // Ensure empty string if null/undefined and DB expects string
        country: validatedData.country,
        postcode: validatedData.postcode,
        streetAddress: validatedData.streetAddress ?? "", // Handle potential null/undefined
        suburb: validatedData.suburb ?? null, // Handle potential null/undefined (assuming DB field is nullable)
        townCity: validatedData.townCity ?? "", // Handle potential null/undefined
        // DO NOT update passwordHash here! That's for the changePassword action.
        // DO NOT update role or tier here unless intended.
      },
      // Select the fields that were potentially updated to return them
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
    console.log(`Profile updated successfully in DB for user ${user.id}.`);

    // 4. Revalidate Cache (Important!)
    // This tells Next.js to clear the cache for pages that might display this data,
    // ensuring the layout fetches fresh data on the next navigation.
    revalidatePath("/settings"); // Revalidate the settings page itself
    revalidatePath("/(customer)", "layout"); // Revalidate the customer layout (important for SessionProvider)

    // 5. Return Success Response with Updated Data
    return {
      success: "Profile information updated successfully.",
      updatedUser: updatedDbUser, // Return the data that was just saved
    };
  } catch (error) {
    // Handle potential Prisma errors (e.g., unique constraint violation)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === "P2002"
    ) {
      // Example: Unique constraint failed (likely email or username)
      const target = (error as any).meta?.target; // Prisma provides info on which field failed
      console.error("Prisma Unique Constraint Error:", error);
      if (target && target.includes("email")) {
        return { error: "This email address is already in use." };
      } else if (target && target.includes("username")) {
        return { error: "This username is already taken." };
      }
      return { error: "A unique value conflict occurred." };
    }

    // Handle other errors
    console.error("Critical error updating profile:", error);
    // Don't expose detailed internal errors to the client
    return {
      error: "Failed to update profile information due to a server error.",
    };
  }
}

// --- Placeholder for updateCheckoutDetails Action ---
// You'll need to implement this similarly if it's not done yet
export async function updateCheckoutDetails(
  formData: CheckoutDetailsFormValues,
): Promise<UpdateActionResult> {
  console.log("updateCheckoutDetails action needs implementation.");
  // --- >> TODO: Implement similar logic as updateCustomerProfileInfo << ---
  // 1. Validate Auth (validateRequest)
  // 2. Validate Data (checkoutDetailsSchema.safeParse)
  // 3. Update User in DB (prisma.user.update with relevant fields like address, phone etc.)
  //    - Note: Decide where checkout-specific details should live. Are they the *same* address fields as personal info,
  //      or should they be separate fields/model if they can differ (e.g., separate Billing/Shipping addresses)?
  //      Your current schema uses the *same* User fields. Map accordingly.
  // 4. Revalidate Path (e.g., revalidatePath('/settings'), revalidatePath('/(customer)', 'layout'))
  // 5. Return Success/Error
  try {
    const { user } = await validateRequest();
    if (!user) return { error: "User not authenticated." };

    const validationResult = checkoutDetailsSchema.safeParse(formData);
    if (!validationResult.success) return { error: "Invalid checkout data." };
    const validatedData = validationResult.data;

    // Assuming checkout details map to the *same* User fields for now:
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName, // Or maybe these are separate billing fields?
        lastName: validatedData.lastName,
        country: validatedData.country,
        streetAddress: validatedData.streetAddress,
        suburb: validatedData.apartmentSuite ?? null, // Map form field 'apartmentSuite' to DB 'suburb'
        townCity: validatedData.townCity,
        postcode: validatedData.postcode,
        phoneNumber: validatedData.phone, // Map form field 'phone' to DB 'phoneNumber'
        // Add province if you have a field for it in Prisma User model
        // Add companyName if you have a field for it in Prisma User model
      },
    });

    revalidatePath("/settings");
    revalidatePath("/(customer)", "layout");

    return { success: "Checkout details updated successfully." };
  } catch (error) {
    console.error("Error updating checkout details:", error);
    return { error: "Failed to update checkout details." };
  }
}

// --- Change Password Server Action (Seems okay, but ensure Argon2 params match registration) ---
// Keep your existing changePassword function, just double-check the hash parameters
export async function changePassword(
  formData: PasswordChangeFormValues,
): Promise<PasswordChangeResult> {
  // ... your existing implementation ...
  // Ensure the hash options match your user registration action exactly:
  // const newPasswordHash = await hash(validatedData.newPassword, {
  //   memoryCost: 19456,
  //   timeCost: 2,
  //   outputLen: 32,
  //   parallelism: 1,
  // });
  // ... rest of your implementation ...

  // Add revalidation here too if successful, although less critical than profile changes
  // revalidatePath('/(customer)', 'layout'); // May invalidate session slightly early, but safer

  // Your existing function logic...
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
    const validationResult = passwordChangeSchema.safeParse(formData);
    if (!validationResult.success) {
      console.warn(
        "Password change validation failed:",
        validationResult.error.flatten(),
      );
      const fieldErrors = validationResult.error.flatten()
        .fieldErrors as Partial<Record<keyof PasswordChangeFormValues, string>>;
      const formErrors = validationResult.error.flatten().formErrors;
      // Prioritize field-specific errors, especially the refinement error
      const specificError =
        fieldErrors.confirmNewPassword ||
        (formErrors.length > 0 ? formErrors[0] : "Invalid input.");
      return {
        success: false,
        error: specificError, // Use the more specific error message
        fieldErrors: fieldErrors,
      };
    }
    const validatedData = validationResult.data; // Use the validated data

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

    // 4. Verify Current Password using @node-rs/argon2
    console.log(
      `Verifying current password for user ${user.id} using @node-rs/argon2...`,
    );
    let validPassword = false;
    try {
      validPassword = await verify(
        dbUser.passwordHash,
        validatedData.currentPassword, // Use validated data
      );
    } catch (verifyError) {
      console.error(
        `Error verifying password for user ${user.id}:`,
        verifyError,
      );
      return {
        success: false,
        error: "Failed to verify current password. Please try again.",
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

    // 5. Hash the New Password using @node-rs/argon2
    console.log("Hashing new password using @node-rs/argon2...");
    const newPasswordHash = await hash(validatedData.newPassword, {
      // Use validated data
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    console.log("New password hashed.");

    // 6. Update Password in Database
    console.log(`Updating password hash in DB for user ${user.id}...`);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });
    console.log(`Password updated successfully in DB for user ${user.id}.`);

    // Revalidate layout cache after successful password change
    revalidatePath("/(customer)", "layout");

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    // ZodError handling was already moved inside the try block for validationResult
    if (error instanceof z.ZodError) {
      // This part might be less likely to be reached now if safeParse is used correctly
      console.warn("Unexpected ZodError location:", error.flatten());
      return { success: false, error: "Input validation failed unexpectedly." };
    }

    console.error("Critical error changing password:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

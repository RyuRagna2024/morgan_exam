// app/(customer)/settings/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
// Import BOTH schemas
import { profileUpdateSchema, checkoutDetailsSchema } from "./types";
import { UserRole } from "@prisma/client";

// --- Existing updateCustomerProfileInfo action ---
export async function updateCustomerProfileInfo(
  values: z.infer<typeof profileUpdateSchema>,
): Promise<{ success?: string; error?: string }> {
  // ... (implementation remains the same)
  const { user } = await validateRequest();
  if (
    !user ||
    (user.role !== UserRole.CUSTOMER && user.role !== UserRole.PROCUSTOMER)
  ) {
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
        username: validatedData.username,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        streetAddress: validatedData.streetAddress,
        suburb: validatedData.suburb,
        townCity: validatedData.townCity,
        postcode: validatedData.postcode,
        country: validatedData.country,
      },
    });
    revalidatePath("/customer/settings");
    revalidatePath("/customer", "layout");
    return { success: "Profile details updated successfully!" };
  } catch (error) {
    /* ... error handling ... */
    console.error("Customer Profile update error:", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid data provided." };
    }
    return { error: "Failed to update profile details." };
  }
}

// --- NEW Action to update User fields relevant to checkout ---
export async function updateCheckoutDetails(
  values: z.infer<typeof checkoutDetailsSchema>,
): Promise<{ success?: string; error?: string }> {
  const { user } = await validateRequest();

  if (
    !user ||
    (user.role !== UserRole.CUSTOMER && user.role !== UserRole.PROCUSTOMER)
  ) {
    return { error: "Unauthorized" };
  }

  try {
    const validatedData = checkoutDetailsSchema.parse(values);

    // Only update fields present in the User model and the checkout schema
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber, // Already checked for required in Zod
        streetAddress: validatedData.streetAddress,
        suburb: validatedData.suburb, // string | undefined
        townCity: validatedData.townCity,
        postcode: validatedData.postcode,
        country: validatedData.country,
        // Cannot update companyName or province as they aren't on User model
      },
    });

    revalidatePath("/customer/settings");
    // Optional revalidation depending on how checkout page fetches data
    // revalidatePath("/checkout");

    return { success: "Checkout details updated successfully!" };
  } catch (error) {
    console.error("Checkout Details update error:", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid data provided. Please check your entries." };
    }
    return { error: "Failed to update checkout details. Please try again." };
  }
}

// app/(customer)/settings/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { profileUpdateSchema } from "./types";
import { UserRole } from "@prisma/client";

export async function updateCustomerProfileInfo(
  values: z.infer<typeof profileUpdateSchema>,
): Promise<{ success?: string; error?: string }> {
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
      // --- Use field names EXACTLY from Prisma Schema ---
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName,
        username: validatedData.username,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber, // string | undefined is fine

        // Renamed fields to match prisma model
        streetAddress: validatedData.streetAddress,
        suburb: validatedData.suburb, // string | undefined is fine
        townCity: validatedData.townCity,
        postcode: validatedData.postcode,
        country: validatedData.country,
        // stateProvince is NOT updated as it's not in the schema
      },
    });

    revalidatePath("/customer/settings");
    revalidatePath("/customer", "layout");

    return { success: "Profile details updated successfully!" };
  } catch (error) {
    console.error("Customer Profile update error:", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid data provided. Please check your entries." };
    }
    return { error: "Failed to update profile details. Please try again." };
  }
}

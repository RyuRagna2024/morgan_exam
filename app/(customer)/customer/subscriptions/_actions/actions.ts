"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { z } from "zod";
import {
  type TierApplicationFormData,
  type TierApplicationResponse,
} from "../types";
import { validateTierApplication } from "../validations";

/**
 * Submits a new tier application for the authenticated customer
 * @param formData The tier application form data
 * @returns The created application or an error message
 */
export async function submitTierApplication(
  formData: TierApplicationFormData,
): Promise<TierApplicationResponse> {
  // Validate that user is authenticated
  const { user, session } = await validateRequest();

  // If no valid session or user, throw an error
  if (!session || user.role !== "CUSTOMER") {
    throw new Error(
      "Unauthorized: You must be logged in as a customer to submit a tier application",
    );
  }

  try {
    // Validate the submitted form data
    const validatedData = validateTierApplication(formData);

    // Create a new tier application
    const tierApplication = await prisma.tierAppForm.create({
      data: {
        package: validatedData.package,
        userId: user.id,
      },
    });

    return {
      success: true,
      application: tierApplication,
      message: `Your application for ${validatedData.package} tier has been submitted successfully!`,
    };
  } catch (error) {
    console.error("Error submitting tier application:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(", ");
      throw new Error(`Validation error: ${errorMessage}`);
    }

    // Handle other errors
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "Failed to submit tier application. Please try again later.",
    );
  }
}

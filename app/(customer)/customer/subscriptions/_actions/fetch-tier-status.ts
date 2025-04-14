"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

/**
 * Fetches the current user's tier status and application history
 * @returns The user's current tier and any pending applications
 */
export async function getUserTierStatus() {
  // Validate that user is authenticated
  const { user, session } = await validateRequest();

  // If no valid session or user, throw an error
  if (!session || user.role !== "CUSTOMER") {
    throw new Error(
      "Unauthorized: You must be logged in as a customer to view tier status",
    );
  }

  try {
    // Get user data including current tier
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        tier: true,
        firstName: true,
        lastName: true,
        displayName: true,
      },
    });

    // Get most recent tier application
    const latestApplication = await prisma.tierAppForm.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Check if the latest application matches the current tier
    // If it matches, the application was approved, so don't return it
    const currentTier = userData?.tier || "BRONZE";
    const showLatestApplication =
      latestApplication && latestApplication.package !== currentTier
        ? latestApplication
        : null;

    return {
      success: true,
      currentTier,
      user: {
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        displayName: userData?.displayName,
      },
      latestApplication: showLatestApplication,
    };
  } catch (error) {
    console.error("Error fetching tier status:", error);
    throw new Error("Failed to fetch tier status. Please try again later.");
  }
}

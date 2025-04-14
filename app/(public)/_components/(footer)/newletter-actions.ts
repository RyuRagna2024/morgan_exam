"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

type NewsletterResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function subscribeToNewsletter(
  formData: FormData,
): Promise<NewsletterResponse> {
  try {
    // Get the current user if they're logged in (optional)
    const { user } = await validateRequest();

    // Get form data
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    // Validate email
    if (!email) {
      throw new Error("Email is required");
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error("Invalid email format");
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique(
      {
        where: { email },
      },
    );

    if (existingSubscription) {
      if (existingSubscription.status === "UNSUBSCRIBED") {
        // Reactivate subscription
        const updated = await prisma.newsletterSubscription.update({
          where: { email },
          data: {
            status: "ACTIVE",
            firstName: firstName || existingSubscription.firstName,
            lastName: lastName || existingSubscription.lastName,
            userId: user?.id || existingSubscription.userId,
          },
        });

        return {
          success: true,
          data: updated,
        };
      }

      throw new Error("Email already subscribed");
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        userId: user?.id || null,
        status: "ACTIVE",
        wantsProductUpdates: true,
        wantsPromotions: true,
        wantsNewsletter: true,
      },
    });

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

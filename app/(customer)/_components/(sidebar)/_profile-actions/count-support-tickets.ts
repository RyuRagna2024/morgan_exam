// app/(customer)/_components/(sidebar)/_profile-actions/count-support-tickets.ts
"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

// Define the response type
interface GetTicketCountResponse {
  success: boolean;
  ticketCount?: number;
  error?: string;
}

/**
 * Gets the count of support tickets created by the currently authenticated customer.
 */
export async function getCustomerSentTicketCount(): Promise<GetTicketCountResponse> {
  try {
    const { user } = await validateRequest();

    // If no user is logged in, return 0 count
    if (!user) {
      return {
        success: true,
        ticketCount: 0,
      };
    }

    // Count tickets where the user is the creator
    const count = await prisma.supportTicket.count({
      where: {
        creatorId: user.id, // Filter by the logged-in user's ID
      },
    });

    return {
      success: true,
      ticketCount: count,
    };
  } catch (error) {
    console.error("Error counting sent support tickets:", error);
    return {
      success: false,
      error: "Failed to count support tickets",
    };
  }
}


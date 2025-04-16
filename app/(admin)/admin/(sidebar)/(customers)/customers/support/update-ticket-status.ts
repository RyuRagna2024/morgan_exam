"use server"; // Mark this as a server action

import { validateRequest } from "@/auth"; // Adjust path to your auth
import prisma from "@/lib/prisma"; // Adjust path to your prisma client
import { TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache"; // Import for potential cache invalidation

// Define the expected input types using Zod (recommended for validation)
import { z } from "zod";

const updateStatusSchema = z.object({
  ticketId: z.string().cuid(), // Validate it's a CUID if that's what you use
  newStatus: z.nativeEnum(TicketStatus), // Ensure it's a valid status
});

// Define the response type
export type UpdateStatusResponse = {
  success: boolean;
  message: string;
};

export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
): Promise<UpdateStatusResponse> {
  // 1. Validate user authentication and authorization (ensure admin)
  const { user } = await validateRequest();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    // Adjust roles as needed
    return { success: false, message: "Unauthorized." };
  }

  // 2. Validate input data
  const validation = updateStatusSchema.safeParse({ ticketId, newStatus });
  if (!validation.success) {
    console.error(
      "Invalid input for status update:",
      validation.error.flatten(),
    );
    return { success: false, message: "Invalid input." };
  }

  // 3. Update the ticket status in the database
  try {
    await prisma.supportTicket.update({
      where: {
        id: validation.data.ticketId,
      },
      data: {
        status: validation.data.newStatus,
        // Optionally update updatedAt timestamp automatically (Prisma does this)
      },
    });

    // 4. Revalidate the path to trigger data refresh on the client
    // This tells Next.js to clear the cache for this page and fetch fresh data
    revalidatePath("/admin/customers/support"); // Revalidate the tickets list page

    return { success: true, message: `Ticket status updated to ${newStatus}.` };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    // Check for specific Prisma errors if needed (e.g., record not found)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { success: false, message: "Ticket not found." };
    }
    return { success: false, message: "Database error updating status." };
  }
}

// Helper type import (add if not already present)
import { Prisma } from "@prisma/client";

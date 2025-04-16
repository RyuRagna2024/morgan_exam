// app/(customer)/customer/mymessages/_actions/add-customer-reply.ts

"use server"; // Mark as server action

import { validateRequest } from "@/auth"; // Adjust path
import prisma from "@/lib/prisma"; // Adjust path
import { Prisma, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for the reply input
const addReplySchema = z.object({
  ticketId: z.string().cuid(), // Or uuid() if your IDs are UUIDs
  content: z
    .string()
    .min(1, "Reply message cannot be empty.")
    .max(5000, "Reply is too long."), // Add reasonable max length
});

// Define the response type for the client component
export type AddReplyResponse = {
  success: boolean;
  message: string; // User-friendly message
};

export async function addCustomerReply(
  ticketId: string,
  content: string,
): Promise<AddReplyResponse> {
  // 1. Authenticate the customer user
  const { user } = await validateRequest();
  if (!user) {
    // Only needs to be logged in. Role check isn't strictly necessary here,
    // but you could add if needed: if (user.role !== 'CUSTOMER' && user.role !== 'PROCUSTOMER') ...
    return { success: false, message: "Unauthorized: Please log in." };
  }

  // 2. Validate the incoming data
  const validation = addReplySchema.safeParse({ ticketId, content });
  if (!validation.success) {
    console.error("Invalid customer reply input:", validation.error.flatten());
    // Return first validation error message or a generic one
    return {
      success: false,
      message: validation.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const { ticketId: validTicketId, content: validContent } = validation.data;

  try {
    // 3. *** CRITICAL SECURITY CHECK: Verify user owns the ticket ***
    // Find the ticket and ensure its creatorId matches the logged-in user's ID
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: validTicketId,
        // Ensure ONLY the creator can reply via this action
        creatorId: user.id,
      },
      select: { id: true, status: true }, // Select only needed fields for check
    });

    // If ticket is not found OR the creatorId doesn't match, fail authorization
    if (!ticket) {
      console.warn(
        `Authorization failed: User ${user.id} attempted to reply to ticket ${validTicketId} they don't own or which doesn't exist.`,
      );
      return {
        success: false,
        message:
          "Could not find the specified ticket or you do not have permission to reply.",
      };
    }

    // 4. Optional: Prevent replying to closed tickets
    if (
      ticket.status === TicketStatus.CLOSED ||
      ticket.status === TicketStatus.RESOLVED
    ) {
      return {
        success: false,
        message: "This ticket is closed and cannot receive further replies.",
      };
    }

    // 5. Create the new message and update the ticket within a transaction
    await prisma.$transaction([
      // Create the message record
      prisma.message.create({
        data: {
          content: validContent,
          ticketId: validTicketId, // Link message to ticket
          senderId: user.id, // Link message to the customer sending it
        },
      }),
      // Update the parent ticket
      prisma.supportTicket.update({
        where: { id: validTicketId },
        data: {
          // Decide if customer reply should change status (e.g., back to OPEN or IN_PROGRESS?)
          // If admin closed it, maybe customer reply re-opens it?
          // status: TicketStatus.OPEN, // Example: Re-open ticket on customer reply
          updatedAt: new Date(), // Manually update timestamp (Prisma @updatedAt might handle this too)
        },
      }),
    ]);

    // 6. Revalidate relevant paths to refresh data on the client
    revalidatePath(`/customer/mymessages/${validTicketId}`); // Revalidate this specific ticket detail page
    revalidatePath(`/customer/mymessages`); // Revalidate the list page (for Last Update time)
    // Also revalidate the admin list/detail pages if admins need immediate updates
    revalidatePath(`/admin/customers/support/${validTicketId}`);
    revalidatePath(`/admin/customers/support`);

    return { success: true, message: "Your reply has been sent." };
  } catch (error) {
    console.error("Error adding customer reply:", error);
    // Handle specific errors if needed (e.g., unique constraints)
    return {
      success: false,
      message: "A database error occurred while sending your reply.",
    };
  }
}

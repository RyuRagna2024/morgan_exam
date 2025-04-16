// app/(admin)/admin/(sidebar)/(customers)/support/[ticketId]/page.tsx

import React from "react";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth"; // Adjust path if needed
import { Prisma, TicketStatus } from "@prisma/client"; // Import Prisma types

// Import the components we will create next
import TicketDetailsCard from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/TicketDetailsCard"; // Adjust path
import MessageThread from "@/components/shared/MessageThread"; // Adjust path
import ReplyForm from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/ReplyForm"; // Adjust path

// Define the expected shape of the detailed ticket data
// Include all messages and their senders
export type FullTicketDetails = Prisma.SupportTicketGetPayload<{
  include: {
    creator: { select: { id: true; username: true; email: true } };
    messages: {
      // Include ALL messages now
      include: {
        sender: { select: { id: true; username: true; role: true } }; // Get sender details
      };
      orderBy: { createdAt: "asc" }; // Order messages chronologically
    };
    // No _count needed here, we get the full message array
  };
}>;

// Server-side function to fetch ONE ticket's details
async function getTicketDetails(
  ticketId: string,
): Promise<FullTicketDetails | null> {
  // Basic validation for ticketId format if needed (e.g., CUID check)
  if (!ticketId || typeof ticketId !== "string" || ticketId.length < 5) {
    // Basic check
    return null;
  }
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        creator: { select: { id: true, username: true, email: true } },
        messages: {
          include: {
            sender: { select: { id: true, username: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return ticket;
  } catch (error) {
    console.error(`Failed to fetch ticket details for ID ${ticketId}:`, error);
    // Handle specific errors like Prisma record not found if desired
    return null;
  }
}

// The dynamic page component
export default async function TicketDetailPage({
  params,
}: {
  params: { ticketId: string };
}) {
  const { ticketId } = params;

  // Validate admin user session
  const { user: adminUser } = await validateRequest();
  if (
    !adminUser ||
    (adminUser.role !== "ADMIN" && adminUser.role !== "SUPERADMIN")
  ) {
    redirect("/login"); // Or admin login page
  }

  const ticket = await getTicketDetails(ticketId);

  // Handle case where ticket is not found
  if (!ticket) {
    notFound(); // Renders the nearest not-found.tsx page
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Component to display ticket details */}
      <TicketDetailsCard ticket={ticket} />

      {/* Component to display the message thread */}
      <MessageThread
        initialMessage={{
          content: ticket.message, // The original message stored on the ticket
          createdAt: ticket.createdAt,
          sender: ticket.creator, // The original sender
        }}
        messages={ticket.messages} // The array of reply messages
        currentUserId={adminUser.id} // Pass the admin's ID for styling checks
      />

      {/* Component for the admin to reply */}
      <ReplyForm ticketId={ticket.id} />
    </div>
  );
}

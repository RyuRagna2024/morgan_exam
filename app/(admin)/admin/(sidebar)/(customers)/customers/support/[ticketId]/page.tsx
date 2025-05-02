// app/(admin)/admin/(sidebar)/(customers)/customers/support/[ticketId]/page.tsx

import React from "react";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth"; // Adjust path if needed
import { Prisma, TicketStatus, UserRole } from "@prisma/client"; // Import UserRole

// Import components
import TicketDetailsCard from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/TicketDetailsCard"; // Adjust path
import MessageThread from "@/components/shared/MessageThread"; // Adjust path
import ReplyForm from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/ReplyForm"; // Adjust path

// --- <<< CORRECTED TYPE DEFINITION >>> ---
// Define the type based on the EXACT structure returned by the query
export type FullTicketDetails = Prisma.SupportTicketGetPayload<{
  include: {
    creator: {
      select: { id: true; username: true; email: true; role: true }; // Specify included User fields
    };
    messages: {
      include: {
        sender: { select: { id: true; username: true; role: true } }; // Specify included Sender fields for each message
      };
      orderBy: { createdAt: "asc" }; // Include orderBy if it affects the type (usually doesn't, but good practice)
    };
  };
}>;
// --- <<< END CORRECTED TYPE DEFINITION >>> ---

// getTicketDetails function with logging
async function getTicketDetails(
  ticketId: string,
): Promise<FullTicketDetails | null> {
  if (!ticketId || typeof ticketId !== "string" || ticketId.length < 5) {
    console.error("Invalid ticketId provided:", ticketId);
    return null;
  }
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        creator: {
          select: { id: true, username: true, email: true, role: true },
        }, // Role included
        messages: {
          include: {
            sender: { select: { id: true, username: true, role: true } },
          }, // Role included
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      // Log added here for clarity if not found
      console.log(`Ticket with ID ${ticketId} not found in database.`);
      return null;
    }

    // Now, TypeScript should be happy if the data logged above includes creator/messages
    // and the FullTicketDetails type matches
    return ticket;
  } catch (error) {
    console.error(`Error fetching ticket details for ID ${ticketId}:`, error);
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

  // Define the array of allowed roles explicitly as UserRole[]
  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPERADMIN]; // Add other admin roles if needed

  if (!adminUser || !allowedRoles.includes(adminUser.role)) {
    console.log(
      `Redirecting user with role ${adminUser?.role ?? "None"} from ticket detail page.`,
    );
    redirect("/login"); // Or your specific admin login page
  }

  // Fetch the ticket details using the server function
  // The type of 'ticket' here is now inferred correctly based on the Promise<FullTicketDetails | null> return type
  const ticket = await getTicketDetails(ticketId);

  // Handle case where ticket is not found after fetching
  if (!ticket) {
    // The getTicketDetails function already logged details if it returned null
    notFound(); // Render the standard Next.js not found page
  }

  // --- TYPE CHECKING SHOULD NOW PASS ---
  // TypeScript now knows 'ticket' MUST have 'creator' and 'messages'
  // because the 'FullTicketDetails' type demands it, and we wouldn't be here if 'ticket' was null.

  // Prepare initial message data
  const initialMessageForThread = {
    content: ticket.message, // Base field from SupportTicket
    createdAt: ticket.createdAt, // Base field from SupportTicket
    sender: ticket.creator, // Now correctly typed via FullTicketDetails
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* The components expect 'ticket' to match 'FullTicketDetails' */}
      <TicketDetailsCard ticket={ticket} />
      <MessageThread
        initialMessage={initialMessageForThread}
        messages={ticket.messages} // Now correctly typed via FullTicketDetails
        currentUserId={adminUser.id} // adminUser is guaranteed to exist here
      />
      <ReplyForm ticketId={ticket.id} />
    </div>
  );
}

// app/(customer)/customer/mymessages/[ticketId]/page.tsx

import React from "react";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth";
import { Prisma, TicketStatus, UserRole } from "@prisma/client";
import MessageThread from "@/components/shared/MessageThread";
import CustomerTicketDetailsCard from "../_components/CustomerTicketDetailsCard";
import CustomerReplyForm from "../_components/CustomerReplyForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Reaffirm Precise Type Definition for the Detail Page ---
// This uses the structure defined by the Prisma query's include
const _fullTicketDetailsPayload =
  Prisma.validator<Prisma.SupportTicketDefaultArgs>()({
    include: {
      messages: {
        // Included relation
        include: {
          sender: {
            select: { id: true, username: true, role: true, displayName: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      // Include scalar fields implicitly unless selecting specific ones
    },
  });
export type FullCustomerTicketDetails = Prisma.SupportTicketGetPayload<
  typeof _fullTicketDetailsPayload
>;
// --- End Type Definition ---

// Local InitialMessage Type
interface InitialMessage {
  content: string;
  createdAt: Date;
  sender: { id: string; username: string; displayName: string; role: UserRole };
  // id?: string;
}

// Fetch function - Ensure return type matches and handles errors
async function getOwnedTicketDetails(
  ticketId: string,
  userId: string,
): Promise<FullCustomerTicketDetails | null> {
  if (!ticketId || !userId) return null;
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId, creatorId: userId },
      // Use the defined include structure again
      include: _fullTicketDetailsPayload.include,
    });
    return ticket; // Returns the fetched ticket (or null if not found/owned)
  } catch (error) {
    console.error(
      `Failed to fetch owned ticket details for ID ${ticketId}:`,
      error,
    );
    return null; // Explicitly return null on error
  }
  // No code path should reach here without returning
}

// Page component
export default async function CustomerTicketDetailPage({
  params,
}: {
  params: { ticketId: string };
}) {
  const { ticketId } = params;
  const { user: customerUser } = await validateRequest();

  if (!customerUser) {
    redirect("/login");
    // Although redirect usually stops execution, adding return null for absolute certainty
    return null;
  }

  // Fetch ticket details - ticket type is FullCustomerTicketDetails | null
  const ticket = await getOwnedTicketDetails(ticketId, customerUser.id);

  if (!ticket) {
    notFound(); // Render Next.js not-found page
    // Similar to redirect, add return null for certainty if notFound doesn't stop execution flow for TS
    return null;
  }

  // Now TypeScript knows 'ticket' is definitely FullCustomerTicketDetails type
  // and thus includes 'messages' because of the type definition derived from Prisma payload.

  const initialMessage: InitialMessage = {
    content: ticket.message, // ticket.message exists on the base SupportTicket model
    createdAt: ticket.createdAt,
    sender: {
      id: customerUser.id,
      username: customerUser.username, // Assuming exists on user
      displayName: customerUser.displayName, // Assuming exists on user
      role: customerUser.role, // Assuming exists on user
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 text-foreground">
      <CustomerTicketDetailsCard ticket={ticket} />
      <MessageThread
        initialMessage={initialMessage}
        // Access ticket.messages - should now be type-safe
        messages={ticket.messages}
        currentUserId={customerUser.id}
      />
      {/* ... Reply Form and Closed Message ... */}
      {ticket.status !== TicketStatus.CLOSED &&
        ticket.status !== TicketStatus.RESOLVED && (
          <CustomerReplyForm ticketId={ticket.id} />
        )}
      {(ticket.status === TicketStatus.CLOSED ||
        ticket.status === TicketStatus.RESOLVED) && (
        <Alert
          variant="default"
          className="text-center text-sm italic border-dashed"
        >
          <AlertDescription>
            This ticket is closed. You cannot add further replies.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

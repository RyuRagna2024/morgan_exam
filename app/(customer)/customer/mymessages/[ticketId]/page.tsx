// app/(customer)/customer/mymessages/[ticketId]/page.tsx

import React from "react";
import prisma from "@/lib/prisma"; // Should be correct relative to root
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth"; // Should be correct relative to root
import { Prisma, TicketStatus, UserRole } from "@prisma/client";

// --- VERIFIED IMPORT PATHS ---
// Shared component using alias - assumes components/shared/ exists at root
import MessageThread from "@/components/shared/MessageThread";
// Components co-located using relative paths - assumes _components is sibling to [ticketId]
import CustomerTicketDetailsCard from "../_components/CustomerTicketDetailsCard";
import CustomerReplyForm from "../_components/CustomerReplyForm";
// --- END VERIFIED IMPORT PATHS ---

// Type definition - Make sure this component exports it
export type FullCustomerTicketDetails = Prisma.SupportTicketGetPayload<{
  include: {
    messages: {
      include: { sender: { select: { id: true; username: true; role: true } } };
      orderBy: { createdAt: "asc" };
    };
  };
}>;

// Fetch function (Ensure this returns correctly)
async function getOwnedTicketDetails(
  ticketId: string,
  userId: string,
): Promise<FullCustomerTicketDetails | null> {
  if (!ticketId || typeof ticketId !== "string" || !userId) {
    return null;
  }
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId, creatorId: userId },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, username: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return ticket; // Return result (can be null)
  } catch (error) {
    console.error(
      `Failed to fetch owned ticket details for ID ${ticketId}:`,
      error,
    );
    return null; // Return null on error
  }
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
  }

  const ticket = await getOwnedTicketDetails(ticketId, customerUser.id);

  if (!ticket) {
    notFound();
  }

  const initialMessage = {
    content: ticket.message,
    createdAt: ticket.createdAt,
    sender: {
      id: customerUser.id,
      username: customerUser.username,
      role: customerUser.role,
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <CustomerTicketDetailsCard ticket={ticket} />
      <MessageThread
        initialMessage={initialMessage}
        messages={ticket.messages}
        currentUserId={customerUser.id}
      />
      {ticket.status !== TicketStatus.CLOSED &&
        ticket.status !== TicketStatus.RESOLVED && (
          <CustomerReplyForm ticketId={ticket.id} />
        )}
      {(ticket.status === TicketStatus.CLOSED ||
        ticket.status === TicketStatus.RESOLVED) && (
        <div className="text-center text-sm text-gray-500 italic py-4">
          This ticket is closed. You cannot add further replies.
        </div>
      )}
    </div>
  );
}

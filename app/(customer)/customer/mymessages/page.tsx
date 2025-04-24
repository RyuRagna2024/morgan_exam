// app/(customer)/customer/mymessages/page.tsx

import React from "react";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth";
import { Prisma, TicketStatus } from "@prisma/client";
import CustomerTicketList from "./_components/CustomerTicketList"; // Corrected path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

// --- More Robust Type Definition ---
// Define the exact payload expected based on the query
const _myTicketListItemPayload =
  Prisma.validator<Prisma.SupportTicketDefaultArgs>()({
    select: {
      // Use select for precision if needed, or include for all scalars
      id: true,
      createdAt: true,
      updatedAt: true, // Often needed for 'Last Update'
      title: true,
      status: true,
      // Include nested counts/relations needed for the LIST view
      messages: {
        select: { createdAt: true }, // Only need createdAt for 'Last Update' logic
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true }, // Count of replies
      },
    },
    // Add where and orderBy if needed, though defined in function usually
  });

// Type for a single ticket ITEM in the list
export type TicketListItem = Prisma.SupportTicketGetPayload<
  typeof _myTicketListItemPayload
>;

// Type for the result of the getMyTickets function
// Ensures the function MUST return an array of this type
type GetMyTicketsResult = TicketListItem[];
// --- End Type Definition ---

// Define the argument type for the Prisma query
const myTicketQueryArgs = (userId: string) =>
  ({
    where: { creatorId: userId },
    // Select the fields defined in _myTicketListItemPayload
    select: _myTicketListItemPayload.select,
    orderBy: { createdAt: "desc" as const },
  }) satisfies Prisma.SupportTicketFindManyArgs; // Ensure args match the payload structure

// Server-side data fetching function - GUARANTEE array return
async function getMyTickets(userId: string): Promise<GetMyTicketsResult> {
  // Return the defined type
  try {
    const args = myTicketQueryArgs(userId);
    const tickets = await prisma.supportTicket.findMany(args);
    // Ensure it's always an array, even if Prisma returns null/undefined somehow (unlikely)
    return tickets ?? [];
  } catch (error) {
    console.error("Failed to fetch user's tickets:", error);
    return []; // Return empty array on error
  }
}

// The Page component
export default async function MyMessagesPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/login");
  }

  // myTickets is now guaranteed to be TicketListItem[]
  const myTickets = await getMyTickets(user.id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="bg-card border-border shadow">
        <CardHeader className="flex flex-row items-center space-x-3 pb-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">My Support Messages</CardTitle>
        </CardHeader>
      </Card>

      {/* Pass the correctly typed tickets array */}
      <CustomerTicketList tickets={myTickets} />
    </div>
  );
}

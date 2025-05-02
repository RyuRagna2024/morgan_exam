// app/(admin)/admin/(sidebar)/(customers)/customers/support/page.tsx

import React from "react";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { TicketStatus } from "@prisma/client";
import { Prisma } from "@prisma/client"; // Import Prisma namespace
import { TicketTable } from "./TicketTable"; // Ensure correct path

// Define the argument type for the findMany query explicitly
const ticketQueryArgs = {
  include: {
    creator: {
      select: { id: true, username: true, email: true },
    },
    messages: {
      select: { createdAt: true },
      orderBy: { createdAt: "desc" } as const,
      take: 1,
    },
    _count: {
      select: { messages: true },
    },
  },
  orderBy: {
    createdAt: "desc" as const,
  },
} satisfies Prisma.SupportTicketFindManyArgs; // Use 'satisfies' for type checking

// Server-side data fetching function
async function getTickets() {
  try {
    const tickets = await prisma.supportTicket.findMany(ticketQueryArgs);
    return tickets;
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return [];
  }
}

// Infer the precise type from the actual return value of the getTickets function
type TicketsQueryResult = Prisma.PromiseReturnType<typeof getTickets>;
export type TicketWithDetails = TicketsQueryResult[number];

// The Page component (Server Component)
export default async function AdminSupportTicketsPage() {
  const tickets = await getTickets();

  return (
    // Main page container
    <div className="container mx-auto px-4 py-8">
      {/* --- REMOVED GRADIENT BAR, ADDED STANDARD HEADER --- */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Tickets List
      </h1>
      {/* --- END STANDARD HEADER --- */}

      {/* Render the table (TicketTable should already handle dark mode) */}
      <TicketTable tickets={tickets} />
    </div>
  );
}

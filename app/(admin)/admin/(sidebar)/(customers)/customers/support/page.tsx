// src/app/admin/customers/support/page.tsx

import React from "react";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { TicketStatus } from "@prisma/client";
import { Prisma } from "@prisma/client"; // Import Prisma namespace
import { TicketTable } from "./TicketTable";

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
      {/* --- ADDED HEADER BAR --- */}
      <div className="mb-6 bg-gradient-to-r from-cyan-500 to-blue-600 shadow rounded-lg px-6 py-4">
        <h1 className="text-2xl font-semibold text-white">Tickets List</h1>
      </div>
      {/* --- END OF HEADER BAR --- */}

      {/* Original H1 removed as title is now in the bar */}
      {/* <h1 className="text-3xl font-bold mb-6 text-gray-800">Tickets List</h1> */}

      {/* Render the table */}
      <TicketTable tickets={tickets} />
    </div>
  );
}

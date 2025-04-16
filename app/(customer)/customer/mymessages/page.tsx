// app/(customer)/customer/mymessages/page.tsx

import React from "react";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth";
import { Prisma, TicketStatus } from "@prisma/client";
import CustomerTicketList from "./_components/CustomerTicketList";

// *** CORRECTED IMPORT PATH using alias to the components directory ***

// Define the argument type for the Prisma query
const myTicketQueryArgs = (userId: string) =>
  ({
    where: { creatorId: userId },
    include: {
      messages: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" } as const,
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { createdAt: "desc" as const },
  }) satisfies Prisma.SupportTicketFindManyArgs;

// Server-side data fetching function
async function getMyTickets(userId: string) {
  try {
    const args = myTicketQueryArgs(userId);
    const tickets = await prisma.supportTicket.findMany(args);
    return tickets;
  } catch (error) {
    console.error("Failed to fetch user's tickets:", error);
    return [];
  }
}

// --- TYPE DEFINITION (Combined) ---
type MyTicketsQueryResult = Prisma.PromiseReturnType<typeof getMyTickets>;
type InferredTicketType = MyTicketsQueryResult[number];
interface ExplicitTicketStructure {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  name: string;
  email: string;
  message: string;
  attachmentUrl: string | null;
  status: TicketStatus;
  creatorId: string;
  messages: { createdAt: Date }[];
  _count: { messages: number };
}
export type TicketWithDetails = InferredTicketType & ExplicitTicketStructure;
// --- END TYPE DEFINITION ---

// The Page component
export default async function MyMessagesPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/login");
  }

  const myTickets = await getMyTickets(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 bg-gradient-to-r from-teal-500 to-cyan-600 shadow rounded-lg px-6 py-4">
        <h1 className="text-2xl font-semibold text-white">My Messages</h1>
      </div>
      {/* Render the component imported from the correct location */}
      <CustomerTicketList tickets={myTickets} />
    </div>
  );
}

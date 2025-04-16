import React from "react";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { redirect } from "next/navigation";
import { TicketStatus, Prisma } from "@prisma/client"; // Import Prisma types
import CustomerTicketList from "./_components/CustomerTicketList";
import { validateRequest } from "@/auth";

// Define the argument type for the Prisma query
const myTicketQueryArgs = (userId: string) =>
  ({
    // Function to create args with userId
    where: {
      creatorId: userId, // Filter by the logged-in user's ID
    },
    include: {
      // We don't need creator details since it's always the current user
      messages: {
        // Get latest reply time
        select: { createdAt: true },
        orderBy: { createdAt: "desc" } as const,
        take: 1,
      },
      _count: {
        // Count reply messages
        select: { messages: true },
      },
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  }) satisfies Prisma.SupportTicketFindManyArgs;

// Server-side data fetching function for *this user's* tickets
async function getMyTickets(userId: string) {
  try {
    const args = myTicketQueryArgs(userId); // Get the query arguments
    const tickets = await prisma.supportTicket.findMany(args);
    return tickets;
  } catch (error) {
    console.error("Failed to fetch user's tickets:", error);
    return [];
  }
}

// --- TYPE INFERENCE AND EXPORT ---
// Infer the precise type from the return value of getMyTickets
// Use a dummy ID, the actual ID doesn't matter for type inference here
type MyTicketsQueryResult = Prisma.PromiseReturnType<typeof getMyTickets>;
// Export the type for a single ticket object, including relations/counts
// This is the type CustomerTicketList.tsx needs to import
export type TicketWithDetails = MyTicketsQueryResult[number];
// --- END TYPE INFERENCE ---

// The Page component (Server Component)
export default async function MyMessagesPage() {
  // 1. Validate user session
  const { user } = await validateRequest();
  if (!user) {
    // Redirect to login if not authenticated
    redirect("/login?message=Please log in to view your messages");
  }

  // 2. Fetch tickets specifically for the logged-in user
  const myTickets = await getMyTickets(user.id);

  // 3. Render the page structure and the client component table
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Bar - similar to admin */}
      <div className="mb-6 bg-gradient-to-r from-teal-500 to-cyan-600 shadow rounded-lg px-6 py-4">
        <h1 className="text-2xl font-semibold text-white">My Messages</h1>
      </div>

      {/* Render the CustomerTicketList component, passing the fetched tickets */}
      <CustomerTicketList tickets={myTickets} />
    </div>
  );
}

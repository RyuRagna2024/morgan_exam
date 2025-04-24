// app/(admin)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { UserRole as PrismaUserRole, TicketStatus } from "@prisma/client"; // <<< Import TicketStatus
import { Session as LuciaSession, User as AuthUser } from "lucia";
import prisma from "@/lib/prisma"; // <<< Import Prisma client

import SessionProvider, { SessionUser, UserRole } from "./SessionProvider";
import Sidebar from "./_components/Sidebar";
import AdminHeader from "./_components/AdminHeader";
import { cn } from "@/lib/utils";

// Helper function to check for active tickets
async function checkActiveTickets(): Promise<boolean> {
  try {
    // Count tickets that are OPEN or IN_PROGRESS
    // You could refine this logic further (e.g., check last updated, last replied by)
    const count = await prisma.supportTicket.count({
      where: {
        status: {
          in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
        },
      },
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking for active tickets:", error);
    return false; // Assume no notifications on error
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: authUser, session: authSession } = await validateRequest();

  if (
    !authUser ||
    !authSession ||
    (authUser.role !== PrismaUserRole.ADMIN &&
      authUser.role !== PrismaUserRole.SUPERADMIN)
  ) {
    redirect("/");
  }

  // Prepare session user object
  const sessionUserForProvider: SessionUser = {
    /* ... */ id: authUser.id,
    username: authUser.username,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    displayName: authUser.displayName,
    avatarUrl: authUser.avatarUrl,
    role: authUser.role as UserRole,
  };

  // --- Fetch Notification Status ---
  const hasNotifications = await checkActiveTickets();
  // --- End Fetch ---

  return (
    <SessionProvider
      value={{ user: sessionUserForProvider, session: authSession }}
    >
      <Toaster richColors position="top-right" />

      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* --- Pass hasNotifications to AdminHeader --- */}
          <AdminHeader hasNotifications={hasNotifications} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/30 dark:bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

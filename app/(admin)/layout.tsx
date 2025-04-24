// app/(admin)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner"; // Using Sonner
import { UserRole as PrismaUserRole } from "@prisma/client";
import { Session as LuciaSession, User as AuthUser } from "lucia";

// Import Provider and types FROM THIS DIRECTORY
// Import UserRole directly (it's now exported)
import SessionProvider, { SessionUser, UserRole } from "./SessionProvider";
import Sidebar from "./_components/Sidebar";
import AdminHeader from "./_components/AdminHeader";
import { cn } from "@/lib/utils";

// export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: authUser, session: authSession } = await validateRequest();

  // 1. Auth check (Allow ADMIN or SUPERADMIN)
  if (
    !authUser ||
    !authSession ||
    (authUser.role !== PrismaUserRole.ADMIN &&
      authUser.role !== PrismaUserRole.SUPERADMIN)
  ) {
    redirect("/");
  }

  // 2. Create client-safe SessionUser.
  const sessionUserForProvider: SessionUser = {
    id: authUser.id,
    username: authUser.username,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    displayName: authUser.displayName,
    avatarUrl: authUser.avatarUrl,
    // Cast using the imported UserRole type
    role: authUser.role as UserRole,
  };

  // 3. Render the new layout structure
  return (
    <SessionProvider
      value={{ user: sessionUserForProvider, session: authSession }}
    >
      <Toaster richColors position="top-right" /> {/* Configure Sonner */}
      {/* Main Full Height Flex Container */}
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* --- Render Admin Sidebar --- */}
        <Sidebar />

        {/* --- Main Content Area Wrapper --- */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* --- Render Admin Header --- */}
          <AdminHeader />

          {/* --- Scrollable Main Content --- */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/30 dark:bg-muted/10">
            {" "}
            {/* Adjusted padding/bg */}
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

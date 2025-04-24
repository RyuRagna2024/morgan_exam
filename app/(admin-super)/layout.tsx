// app/(admin-super)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner"; // Using Sonner
import { UserRole as PrismaUserRole } from "@prisma/client";
import { Session as LuciaSession, User as AuthUser } from "lucia";

// Import Provider and types FROM THIS DIRECTORY
// Import UserRole directly (it's now exported)
import SessionProvider, { SessionUser, UserRole } from "./SessionProvider";
import SuperAdminSidebar from "./_components/SuperAdminSidebar";
import SuperAdminHeader from "./_components/SuperAdminHeader";
import { cn } from "@/lib/utils"; // Import cn

// export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: authUser, session: authSession } = await validateRequest();

  // 1. Check authentication AND authorization
  if (
    !authUser ||
    !authSession ||
    authUser.role !== PrismaUserRole.SUPERADMIN
  ) {
    redirect("/");
  }

  // 2. Create the client-safe SessionUser object.
  const sessionUserForProvider: SessionUser = {
    id: authUser.id,
    username: authUser.username,
    displayName: authUser.displayName,
    avatarUrl: authUser.avatarUrl,
    // Cast using the imported UserRole type
    role: authUser.role as UserRole,
  };

  // 3. Render the layout with the provider
  return (
    <SessionProvider
      value={{ user: sessionUserForProvider, session: authSession }}
    >
      <Toaster richColors position="top-right" /> {/* Configure Sonner */}
      {/* Main Flex Container */}
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* --- Render New Sidebar --- */}
        <SuperAdminSidebar />

        {/* --- Main Content Area Wrapper --- */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* --- Render New Header --- */}
          <SuperAdminHeader />

          {/* --- Scrollable Main Content --- */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/30 dark:bg-muted/10">
            {" "}
            {/* Added padding, adjusted bg */}
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

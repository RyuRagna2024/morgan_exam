// app/(manager)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import ManagerNavbar from "./_components/ManagerNavbar";
import ManagerSidebar from "./_components/ManagerSidebar";
import { Toaster } from "sonner";
import SessionProvider, { SessionUser } from "./SessionProvider";
import { cn } from "@/lib/utils";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: authUser, session: authSession } = await validateRequest();

  if (!authUser || !authSession || authUser.role !== UserRole.MANAGER) {
    return redirect("/");
  }

  const managerSessionUser: SessionUser = {
    id: authUser.id,
    username: authUser.username,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    displayName: authUser.displayName,
    email: authUser.email,
    avatarUrl: authUser.avatarUrl ?? null,
    backgroundUrl: authUser.backgroundUrl ?? null,
    role: authUser.role,
  };

  return (
    <SessionProvider value={{ user: managerSessionUser, session: authSession }}>
      {/* *** REMOVE overflow-hidden from root *** */}
      <div className="flex h-screen w-screen bg-background">
        {" "}
        {/* Removed overflow-hidden */}
        {/* Sidebar Area */}
        <div className="flex-shrink-0 hidden md:block">
          <ManagerSidebar />
        </div>
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {" "}
          {/* Keep overflow-hidden REMOVED here too */}
          <ManagerNavbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/40">
            <Toaster richColors position="top-center" />
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

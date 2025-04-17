// app/(manager)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { Session as LuciaSession } from "lucia";

import ManagerNavbar from "./_components/ManagerNavbar";
import ManagerSidebar from "./_components/ManagerSidebar";
import { Toaster } from "sonner";
import SessionProvider, { SessionUser } from "./SessionProvider";

// export const dynamic = "force-dynamic";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: fullUser, session } = await validateRequest();

  if (!fullUser || !session) {
    return redirect("/login");
  }

  if (fullUser.role !== UserRole.MANAGER) {
    return redirect("/");
  }

  const sessionUser: SessionUser = {
    id: fullUser.id,
    username: fullUser.username,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    displayName: fullUser.displayName,
    email: fullUser.email,
    avatarUrl: fullUser.avatarUrl,
    backgroundUrl: fullUser.backgroundUrl,
    role: fullUser.role as UserRole,
  };

  return (
    <SessionProvider value={{ user: sessionUser, session: session }}>
      <div className="h-full flex flex-col">
        {/* Pass NO user prop to Navbar */}
        <ManagerNavbar />
        <div className="h-[88px]"></div>
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:flex">
            {/* Pass NO user prop to Sidebar */}
            <ManagerSidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background text-foreground">
            <Toaster richColors position="top-center" />
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

// app/(admin-super)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast"; // Or use sonner if preferred
import { UserRole as PrismaUserRole } from "@prisma/client"; // Use alias for Prisma enum
import { Session as LuciaSession, User as AuthUser } from "lucia"; // Import Auth types

// Import Provider and types FROM THIS DIRECTORY
import SessionProvider, {
  SessionUser,
  UserRole as SuperAdminUserRole,
} from "./SessionProvider";
import Navbar from "./_components/Navbar"; // Assuming Navbar is specific to super-admin

// export const dynamic = "force-dynamic"; // Uncomment if needed

export default async function SuperAdminLayout({
  // Renamed layout function for clarity
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the full auth session object { user: AuthUser | null, session: LuciaSession | null }
  const { user: authUser, session: authSession } = await validateRequest();

  // 1. Check authentication AND authorization
  if (
    !authUser ||
    !authSession ||
    authUser.role !== PrismaUserRole.SUPERADMIN
  ) {
    // Redirect non-superadmins away (e.g., to login or home)
    redirect("/"); // Or perhaps "/login"
  }

  // 2. User is authenticated and is SUPERADMIN. Create the client-safe SessionUser object.
  //    Ensure this object matches the SessionUser interface in app/(admin-super)/SessionProvider.tsx
  const sessionUserForProvider: SessionUser = {
    id: authUser.id,
    username: authUser.username,
    displayName: authUser.displayName,
    avatarUrl: authUser.avatarUrl,
    // Cast the role from Prisma's enum to the SessionProvider's UserRole type
    role: authUser.role as SuperAdminUserRole, // Safe cast after check above
    // Add/remove fields here to exactly match the SessionUser interface definition
    // in ./SessionProvider.tsx
  };

  // 3. Render the layout with the provider
  return (
    // Pass the structured value prop
    <SessionProvider
      value={{ user: sessionUserForProvider, session: authSession }}
    >
      <Toaster /> {/* Or <Toaster richColors position="top-center" /> */}
      <div className="flex min-h-screen flex-col">
        <Navbar /> {/* Assuming Navbar uses useSession() internally now */}
        {/* Consider adding a spacer div if Navbar is fixed */}
        {/* <div className="h-[navbar-height]"></div> */}
        <div className="flex w-full flex-1">
          {" "}
          {/* Use flex-1 for grow */}
          {/* Optional: Add Sidebar component here if needed */}
          {/* <SuperAdminSidebar /> */}
          <main className="flex-grow p-4 md:p-6">
            {" "}
            {/* Add padding */}
            {children}
          </main>
        </div>
        {/* Consider a more structured footer */}
        <footer className="p-4 text-center text-sm text-muted-foreground border-t">
          FOOTER
        </footer>
      </div>
    </SessionProvider>
  );
}

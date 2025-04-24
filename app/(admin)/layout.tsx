// app/(admin)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast"; // Or use sonner
import { UserRole as PrismaUserRole } from "@prisma/client"; // Use alias
import { Session as LuciaSession, User as AuthUser } from "lucia"; // Import Auth types

// Import Provider and types FROM THIS DIRECTORY
import SessionProvider, {
  SessionUser,
  UserRole as AdminUserRole,
} from "./SessionProvider";
import Navbar from "./_components/Navbar";
import Sidebar from "./_components/Sidebar"; // Assuming Sidebar uses useSession() now

// export const dynamic = "force-dynamic"; // Uncomment if needed

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the full auth session object
  const { user: authUser, session: authSession } = await validateRequest();

  // 1. Check authentication AND authorization (Allow ADMIN or SUPERADMIN)
  if (
    !authUser ||
    !authSession ||
    (authUser.role !== PrismaUserRole.ADMIN &&
      authUser.role !== PrismaUserRole.SUPERADMIN)
  ) {
    // Redirect non-admins/superadmins away
    redirect("/"); // Or "/login"
  }

  // 2. User is authenticated and has the correct role. Create the client-safe SessionUser.
  //    Ensure this object matches the SessionUser interface in app/(admin)/SessionProvider.tsx
  const sessionUserForProvider: SessionUser = {
    id: authUser.id,
    username: authUser.username,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    displayName: authUser.displayName,
    avatarUrl: authUser.avatarUrl,
    // Cast the role from Prisma's enum to the SessionProvider's UserRole type
    role: authUser.role as AdminUserRole, // Safe cast after check above
    // Add/remove fields here to exactly match the SessionUser interface
    // in ./SessionProvider.tsx (e.g., removed postcode, country, backgroundUrl)
  };

  // 3. Render the layout with the provider
  return (
    // Pass the structured value prop
    <SessionProvider
      value={{ user: sessionUserForProvider, session: authSession }}
    >
      <div className="flex h-screen flex-col">
        <Navbar /> {/* Assumes Navbar uses useSession() */}
        {/* Add spacer if Navbar is fixed-position */}
        {/* <div className="h-[navbar-height]"></div> */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar /> {/* Assumes Sidebar uses useSession() */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {" "}
            {/* Added padding */}
            {children}
          </main>
        </div>
        {/* Consider moving Toaster inside main or keeping at end */}
        <Toaster />
      </div>
    </SessionProvider>
  );
}

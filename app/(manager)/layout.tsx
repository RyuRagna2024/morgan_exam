// app/(manager)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client"; // Using Prisma's enum directly
import { Session as LuciaSession } from "lucia"; // Import Session type if needed

// Import Manager specific components
import ManagerNavbar from "./_components/ManagerNavbar";
import ManagerSidebar from "./_components/ManagerSidebar";
import { Toaster } from "sonner"; // <<< ENSURE THIS IMPORT IS UNCOMMENTED
import SessionProvider, { SessionUser } from "./SessionProvider"; // Import SessionProvider and its User type

// Optional: Set dynamic fetching if needed
// export const dynamic = "force-dynamic";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the full user and session details from Lucia auth
  const { user: fullUser, session } = await validateRequest();

  // 1. Check if user is logged in, redirect to login if not
  if (!fullUser || !session) {
    return redirect("/login"); // Or your specific login route
  }

  // 2. Check if the logged-in user has the required MANAGER role
  if (fullUser.role !== UserRole.MANAGER) {
    return redirect("/"); // Redirect non-managers away (e.g., to home)
  }

  // 3. Create the client-safe SessionUser object for the SessionProvider
  //    Include ONLY the fields defined in the SessionUser interface (in app/(manager)/SessionProvider.tsx)
  const sessionUser: SessionUser = {
    id: fullUser.id,
    username: fullUser.username,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    displayName: fullUser.displayName,
    email: fullUser.email,
    avatarUrl: fullUser.avatarUrl,
    backgroundUrl: fullUser.backgroundUrl,
    role: fullUser.role as UserRole, // Already checked role above, safe to cast
    // Add/remove fields here to exactly match your SessionUser interface definition
  };

  // User is authenticated and is a manager
  return (
    // Provide session context to client components within this layout
    <SessionProvider value={{ user: sessionUser, session: session }}>
      {/* Main layout structure */}
      <div className="h-full flex flex-col">
        {" "}
        {/* Use h-full if you want layout to take full screen height */}
        {/* Fixed Navbar */}
        <ManagerNavbar user={fullUser} />
        {/* Spacer div to push content below fixed navbar - height must match navbar */}
        <div className="h-[88px]"></div>
        {/* Container for Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {" "}
          {/* flex-1 takes remaining height */}
          {/* Sidebar */}
          <div className="hidden md:flex">
            {" "}
            {/* Sidebar hidden on small screens */}
            <ManagerSidebar user={fullUser} />
          </div>
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background text-foreground">
            {" "}
            {/* Scrollable content area with padding */}
            <Toaster richColors position="top-center" />{" "}
            {/* <<< RE-ENABLED Toaster rendering (added richColors, position optional) */}
            {children} {/* Render the actual page content here */}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

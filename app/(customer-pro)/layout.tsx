// app/(customer-pro)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast"; // Or use sonner
import { UserRole as PrismaUserRole } from "@prisma/client"; // Use alias
import { Session as LuciaSession, User as AuthUser } from "lucia"; // Import Auth types

// Import Provider and types FROM THIS DIRECTORY
import SessionProvider, {
  SessionUser,
  UserRole as ProCustomerUserRole,
} from "./SessionProvider";
import Navbar from "./_components/Navbar"; // Assuming a specific Navbar for pro customers
// Potentially import a Sidebar if pro customers have one
// import ProCustomerSidebar from "./_components/ProCustomerSidebar";

// export const dynamic = "force-dynamic"; // Uncomment if needed

export default async function ProCustomerLayout({
  // Renamed layout function
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the full auth session object
  const { user: authUser, session: authSession } = await validateRequest();

  // 1. Check authentication AND authorization for PROCUSTOMER
  if (
    !authUser ||
    !authSession ||
    authUser.role !== PrismaUserRole.PROCUSTOMER
  ) {
    // Redirect non-pro-customers away (e.g., to login or maybe customer dashboard)
    redirect("/login"); // Adjust redirect as needed
  }

  // 2. User is authenticated and is PROCUSTOMER. Create the client-safe SessionUser object.
  //    Ensure this object matches the SessionUser interface in app/(customer-pro)/SessionProvider.tsx
  const sessionUserForProvider: SessionUser = {
    id: authUser.id,
    username: authUser.username,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    displayName: authUser.displayName,
    email: authUser.email, // Added email
    postcode: authUser.postcode,
    country: authUser.country,
    avatarUrl: authUser.avatarUrl,
    backgroundUrl: authUser.backgroundUrl,
    phoneNumber: authUser.phoneNumber, // Added phone
    // Cast the role from Prisma's enum to the SessionProvider's UserRole type
    role: authUser.role as ProCustomerUserRole, // Safe cast after check above
    // Add/remove fields here to exactly match the SessionUser interface
    // in ./SessionProvider.tsx
  };

  // 3. Render the layout with the provider
  return (
    // Pass the structured value prop
    <SessionProvider
      value={{ user: sessionUserForProvider, session: authSession }}
    >
      <Toaster /> {/* Or use sonner */}
      <div className="flex min-h-screen flex-col">
        <Navbar /> {/* Assumes Navbar uses useSession() */}
        {/* Add spacer if Navbar is fixed */}
        {/* <div className="h-[navbar-height]"></div> */}
        <div className="flex w-full flex-1">
          {" "}
          {/* Changed grow to flex-1 */}
          {/* Optional: Add Pro Customer Sidebar */}
          {/* <ProCustomerSidebar /> */}
          <main className="flex-grow p-4 md:p-6">
            {" "}
            {/* Added padding */}
            {children}
          </main>
        </div>
        {/* Replace generic FOOTER with a proper component/structure if needed */}
        <footer className="p-4 text-center text-sm text-muted-foreground border-t">
          FOOTER
        </footer>
      </div>
    </SessionProvider>
  );
}

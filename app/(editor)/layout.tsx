// app/(editor)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { UserRole as PrismaUserRole } from "@prisma/client";
// Import SessionProvider AND SessionUser type from THIS directory's provider
import SessionProvider, {
  SessionUser,
  UserRole as EditorUserRole,
} from "./SessionProvider"; // <<< Uses ./SessionProvider
import Navbar from "./_components/Navbar";

export const dynamic = "force-dynamic";

export default async function EditorLayout({
  // Renamed from CustomerLayout
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch full user data and session from auth
  const { user: authUser, session: authSession } = await validateRequest();

  // Authentication and Authorization check
  // Use PrismaUserRole for comparison with DB value
  if (!authUser || !authSession || authUser.role !== PrismaUserRole.EDITOR) {
    // Redirect if not logged in or not an editor
    return redirect("/"); // Redirect to home or login page
  }

  // --- Create the client-safe SessionUser object ---
  // Ensure all fields required by Editor SessionUser interface are included
  const editorSessionUser: SessionUser = {
    id: authUser.id,
    username: authUser.username,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    displayName: authUser.displayName,
    postcode: authUser.postcode, // Include if needed by Editor context
    country: authUser.country, // Include if needed by Editor context
    avatarUrl: authUser.avatarUrl ?? null,
    backgroundUrl: authUser.backgroundUrl ?? null,
    // Cast the Prisma role to the EditorUserRole type defined in Editor SessionProvider
    role: authUser.role as EditorUserRole, // <<< Cast to local type
  };

  return (
    // Use the Editor SessionProvider from this directory
    <SessionProvider value={{ user: editorSessionUser, session: authSession }}>
      <Toaster />
      <div className="flex min-h-screen flex-col">
        <Navbar /> {/* This Navbar will use the Editor SessionProvider */}
        {/* Removed <div className="bg-slate-400"></div> */}
        <div className="flex w-full grow">
          <main className="flex-grow p-4 md:p-6 bg-muted/40">
            {" "}
            {/* Added some padding and background */}
            {children}
          </main>
        </div>
        {/* Consider adding a footer specific to editor if needed */}
        {/* FOOTER */}
      </div>
    </SessionProvider>
  );
}

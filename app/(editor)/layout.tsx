// app/(editor)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast"; // Or sonner
import { UserRole as PrismaUserRole } from "@prisma/client";
// Import Editor's SessionProvider and SessionUser type
import SessionProvider, { SessionUser } from "./SessionProvider";
import Navbar from "./_components/Navbar"; // Editor's Navbar

export const dynamic = "force-dynamic"; // Good practice for auth routes

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch full user data
  const { user: authUser, session: authSession } = await validateRequest();

  // Auth check: Must be logged in AND be an EDITOR
  if (!authUser || !authSession || authUser.role !== PrismaUserRole.EDITOR) {
    console.log(
      `Redirecting: User role is ${authUser?.role ?? "none"}, required EDITOR`,
    );
    return redirect("/"); // Redirect non-editors
  }

  // Prepare user data specifically for the Editor context
  const editorSessionUser: SessionUser = {
    id: authUser.id,
    displayName: authUser.displayName,
    avatarUrl: authUser.avatarUrl ?? null,
    role: authUser.role, // No need to cast if SessionUser uses Prisma enum
    // Only include fields defined in Editor's SessionUser interface
  };

  return (
    // Use the Editor's SessionProvider
    <SessionProvider value={{ user: editorSessionUser, session: authSession }}>
      <Toaster position="top-center" /> {/* Or your preferred toaster setup */}
      <div className="flex min-h-screen flex-col">
        <Navbar /> {/* Render Editor's Navbar */}
        {/* Main content area for editor pages */}
        <main className="flex-grow p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        {/* Optional Editor Footer */}
      </div>
    </SessionProvider>
  );
}

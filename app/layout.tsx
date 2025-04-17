// app/layout.tsx

// Remove Toaster import if not used elsewhere in this specific file
// import { Toaster } from "sonner";

import "./globals.css";
import { ThemeProvider } from "next-themes";

// Import from the ROOT SessionProvider
import SessionProvider, {
  SessionUser as RootSessionUser, // Use alias to avoid confusion if needed
  UserRole as RootUserRole, // Use alias
} from "./SessionProvider"; // Ensure this path points to app/SessionProvider.tsx

import { validateRequest } from "@/auth";
import { User as AuthUser, Session as AuthSession } from "lucia"; // Get the types from auth

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rename fetched user/session to avoid naming conflicts
  const { user: authUser, session: authSession } = await validateRequest();

  // Prepare the user object for the Root SessionProvider
  // It needs to match the RootSessionUser interface defined in app/SessionProvider.tsx
  let rootSessionUser: RootSessionUser | null = null;
  if (authUser) {
    rootSessionUser = {
      id: authUser.id,
      displayName: authUser.displayName, // Make sure displayName exists on authUser
      avatarUrl: authUser.avatarUrl,
      // Cast the role from the auth user (which uses Prisma enum) to the RootUserRole type
      role: authUser.role as RootUserRole, // <<< Crucial Cast
      // Add any other fields required by your RootSessionUser interface
    };
  }

  return (
    <html lang="en" suppressHydrationWarning>
      {/* Ensure body has necessary classes */}
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Pass the prepared rootSessionUser and the authSession */}
        <SessionProvider
          value={{ user: rootSessionUser, session: authSession }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // Or your preferred default
            enableSystem={false} // Or true if you want system preference
            disableTransitionOnChange
          >
            {children}
            {/* --- REMOVED <Toaster /> --- */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

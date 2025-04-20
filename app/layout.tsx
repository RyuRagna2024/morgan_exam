// app/layout.tsx

import "./globals.css";
import { ThemeProvider } from "next-themes";

// Import from the ROOT SessionProvider
import SessionProvider, {
  SessionUser as RootSessionUser, // Use alias to avoid confusion if needed
  UserRole as RootUserRole, // Use alias
} from "./SessionProvider"; // Ensure this path points to app/SessionProvider.tsx

import { validateRequest } from "@/auth";
import { User as AuthUser, Session as AuthSession } from "lucia"; // Get the types from auth
import { Tier } from "@prisma/client"; // <<< Import the Tier enum from Prisma client

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rename fetched user/session to avoid naming conflicts
  // Assuming validateRequest returns the user object with the tier field
  const { user: authUser, session: authSession } = await validateRequest();

  // Prepare the user object for the Root SessionProvider
  // It needs to match the RootSessionUser interface defined in app/SessionProvider.tsx
  let rootSessionUser: RootSessionUser | null = null;
  if (authUser) {
    // --- ** ADD tier FIELD ** ---
    rootSessionUser = {
      id: authUser.id,
      displayName: authUser.displayName, // Ensure displayName exists on authUser
      avatarUrl: authUser.avatarUrl ?? null, // Use ?? null for safety
      // Cast the role from the auth user (which uses Prisma enum) to the RootUserRole type
      role: authUser.role as RootUserRole, // Keep existing cast
      tier: authUser.tier, // <<< ADDED the tier field
      // (Assumes authUser from validateRequest includes 'tier' of type Tier)
      // Add any other fields required by your RootSessionUser interface
    };
    // --- ** END OF CHANGE ** ---
  }

  return (
    <html lang="en" suppressHydrationWarning>
      {/* Ensure body has necessary classes */}
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Pass the prepared rootSessionUser (now including tier) and the authSession */}
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
            {/* Toaster might be needed elsewhere, e.g., in specific page layouts */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

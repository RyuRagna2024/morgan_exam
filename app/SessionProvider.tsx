// app/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";
import { Tier } from "@prisma/client"; // Import the Tier enum from Prisma client

// --- Define UserRole INCLUDING ALL ROLES from Prisma ---
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER";

// --- ** ADD Tier field TO SessionUser INTERFACE ** ---
export interface SessionUser {
  id: string;
  // username?: string; // Optional, include if needed globally
  displayName: string;
  // email?: string;    // Optional
  avatarUrl: string | null;
  // backgroundUrl?: string | null; // Less likely needed globally
  role: UserRole;
  tier: Tier; // <<< ADDED the tier field here, using the Prisma enum type
  // Add other *globally* needed fields
}
// --- ** END OF CHANGE ** ---

// Extend Lucia's Session type for the ROOT context
export interface SessionWithUser extends LuciaSession {
  user: SessionUser; // Uses the root SessionUser type
}

// Define the type for allowed updates IN THE ROOT context (likely none or minimal)
type RootProfileUpdates = Partial<
  Pick<SessionUser, "avatarUrl" /* add others if needed */>
>;

// Updated context interface for the ROOT context
interface SessionContext {
  user: SessionUser | null;
  session: SessionWithUser | null;
  // updateProfile: (updates: RootProfileUpdates) => void; // Optional
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  // Expect the SessionUser type defined *in this file*
  value: {
    // Ensure the value passed in conforms to the updated SessionUser
    user: SessionUser | null;
    session: LuciaSession | null;
  };
}) {
  // State now uses the updated SessionUser type
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  useEffect(() => {
    // Ensure the incoming value.user conforms to the updated SessionUser type
    setUserData(value.user);
  }, [value.user]);

  // Optional: Define updateProfile if needed for root context
  // const updateProfile = (updates: RootProfileUpdates) => { ... }

  const sessionValue: SessionContext = {
    user: userData,
    // Ensure the session object merges correctly with the updated userData
    session:
      value.session && userData ? { ...value.session, user: userData } : null,
    // updateProfile, // Optional
  };

  return (
    <SessionContext.Provider value={sessionValue}>
      {children}
    </SessionContext.Provider>
  );
}

// Keep the useSession hook for the root context
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSession (Root) must be used within a Root SessionProvider",
    );
  }
  return context;
}

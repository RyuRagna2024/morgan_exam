// app/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";

// --- Define UserRole INCLUDING ALL ROLES from Prisma ---
// Make sure this includes every role defined in your prisma schema
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER"; // <<< Ensure MANAGER and all others are here

// Define the SessionUser type for the ROOT context
// Include fields commonly needed across the entire app *before* specific layouts
// This might be a minimal set compared to customer/manager providers
export interface SessionUser {
  id: string;
  // username?: string; // Optional, include if needed globally
  displayName: string; // Usually needed for display
  // email?: string;    // Optional
  avatarUrl: string | null; // Often needed for navbars
  // backgroundUrl?: string | null; // Less likely needed globally
  role: UserRole; // <<< Use the comprehensive UserRole defined above
  // Add other *globally* needed fields
}

// Extend Lucia's Session type for the ROOT context
export interface SessionWithUser extends LuciaSession {
  user: SessionUser; // Uses the root SessionUser type
}

// Define the type for allowed updates IN THE ROOT context (likely none or minimal)
// For the root provider, you might not need an update function, or it might be empty/limited.
// If you don't need client-side updates triggered from the root context, simplify this.
type RootProfileUpdates = Partial<
  Pick<SessionUser, "avatarUrl" /* add others if needed */>
>;

// Updated context interface for the ROOT context
interface SessionContext {
  user: SessionUser | null;
  session: SessionWithUser | null;
  // updateProfile: (updates: RootProfileUpdates) => void; // Optional: uncomment if root updates needed
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  // Expect the SessionUser type defined *in this file*
  value: {
    user: SessionUser | null;
    session: LuciaSession | null;
  };
}) {
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  // Optional: Define updateProfile if needed for root context
  // const updateProfile = (updates: RootProfileUpdates) => {
  //   setUserData((prevUser) => {
  //     if (!prevUser) return null;
  //     return { ...prevUser, ...updates };
  //   });
  // };

  const sessionValue: SessionContext = {
    user: userData,
    session:
      value.session && userData ? { ...value.session, user: userData } : null,
    // updateProfile, // Optional: uncomment if using updateProfile
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

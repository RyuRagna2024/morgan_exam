// app/(admin-super)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react"; // Added useState, useEffect
import { Session as LuciaSession } from "lucia";

// --- Define UserRole enum to match Prisma (Include ALL roles) ---
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER"; // <<< ADDED MANAGER

// Define the SessionUser type specific to SUPER ADMIN context
// Include only fields needed client-side within this specific layout/context
export interface SessionUser {
  id: string;
  username: string;
  // firstName: string; // Include if needed by super admin UI
  // lastName: string;  // Include if needed by super admin UI
  displayName: string; // Often useful for display
  // postcode: string; // Unlikely needed for super admin
  // country: string;  // Unlikely needed for super admin
  avatarUrl: string | null; // May be needed for navbar/user button
  // backgroundUrl: string | null; // Unlikely needed for super admin
  role: UserRole; // Use the updated UserRole type
  // Add any other fields specifically required by the super admin client components
}

// Extend Lucia's Session type with the SUPER ADMIN SessionUser type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the context interface for SUPER ADMIN context
interface SessionContext {
  user: SessionUser | null; // Allow null initially
  session: SessionWithUser | null; // Allow null initially
  // Add updateProfile function if super admins can update parts of their profile client-side
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value, // The value prop comes PRE-FORMATTED from the layout now
}: {
  children: React.ReactNode;
  // Expect the structure prepared by the layout
  value: {
    user: SessionUser | null; // Expect the specific SessionUser (or null)
    session: LuciaSession | null; // Expect the base Lucia session (or null)
  };
}) {
  // Use state to manage the user data within the provider
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  // Sync state if the initial value prop changes (optional but good practice)
  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  // Create the context value using internal state
  const sessionContextValue: SessionContext = {
    user: userData,
    // Reconstruct SessionWithUser if session and userData exist
    session:
      value.session && userData ? { ...value.session, user: userData } : null,
  };

  return (
    <SessionContext.Provider value={sessionContextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// useSession hook remains the same
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

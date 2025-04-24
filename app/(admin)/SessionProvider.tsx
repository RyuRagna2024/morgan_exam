// app/(admin)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react"; // Added useState
import { Session as LuciaSession } from "lucia";
import { logout } from "../(auth)/actions"; // Ensure this path is correct

// --- Define UserRole enum to match Prisma (Include ALL roles) ---
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER"; // <<< ADDED MANAGER

// Define the SessionUser type specific to ADMIN context
// Include fields needed client-side for Admins/SuperAdmins using this layout
export interface SessionUser {
  id: string;
  username: string;
  firstName: string; // Likely needed
  lastName: string; // Likely needed
  displayName: string; // Useful for display
  // postcode: string;      // Probably not needed for admin tasks
  // country: string;       // Probably not needed for admin tasks
  avatarUrl: string | null; // Needed for navbar/user button
  // backgroundUrl: string | null; // Probably not needed
  role: UserRole; // Use the updated UserRole type
  // Add any other fields specifically required by admin client components
}

// Extend Lucia's Session type with the ADMIN SessionUser type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the context interface for ADMIN context
interface SessionContext {
  user: SessionUser | null; // Allow null initially
  session: SessionWithUser | null; // Allow null initially
  // Add updateProfile if admins can update parts of their profile client-side?
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value, // The value prop comes PRE-FORMATTED from the layout
}: {
  children: React.ReactNode;
  // Expect the structure prepared by the layout
  value: {
    user: SessionUser | null; // Expect the specific admin SessionUser (or null)
    session: LuciaSession | null; // Expect the base Lucia session (or null)
  };
}) {
  // Use state to manage the user data within the provider
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  // Sync state if the initial value prop changes
  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  // Auto logout timer (remains the same)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Consider adding a confirmation or notification before logging out
      logout();
    }, 7200000); // 2 hours
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

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
    throw new Error("useSession must be used within an Admin SessionProvider");
  }
  return context;
}

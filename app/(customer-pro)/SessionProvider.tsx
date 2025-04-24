// app/(customer-pro)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react"; // Added useState, useEffect
import { Session as LuciaSession } from "lucia";

// --- Define UserRole enum to match Prisma (Include ALL roles) ---
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER" // Relevant role for this context
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER"; // <<< ADDED MANAGER

// Define the SessionUser type specific to PRO CUSTOMER context
// This might be very similar or identical to the regular customer SessionUser
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string; // Added email as it's usually needed
  postcode: string;
  country: string;
  avatarUrl: string | null;
  backgroundUrl: string | null; // Kept background as customers might use it
  role: UserRole; // Use the updated UserRole type
  phoneNumber?: string | null; // Added optional phone number
  // Add any other fields specifically relevant to PRO customers if different from regular
}

// Extend Lucia's Session type with the PRO CUSTOMER SessionUser type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the context interface for PRO CUSTOMER context
// Include updateProfile if pro customers can update their profile client-side
interface SessionContext {
  user: SessionUser | null; // Allow null initially
  session: SessionWithUser | null; // Allow null initially
  // Add updateProfile function signature if needed
  // updateProfile: (updates: Partial<SessionUser>) => void;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value, // The value prop comes PRE-FORMATTED from the layout
}: {
  children: React.ReactNode;
  // Expect the structure prepared by the layout
  value: {
    user: SessionUser | null; // Expect the specific pro customer SessionUser (or null)
    session: LuciaSession | null; // Expect the base Lucia session (or null)
  };
}) {
  // Use state to manage the user data within the provider
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  // Sync state if the initial value prop changes
  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  // Define updateProfile function here if needed for this context

  // Create the context value using internal state
  const sessionContextValue: SessionContext = {
    user: userData,
    // Reconstruct SessionWithUser if session and userData exist
    session:
      value.session && userData ? { ...value.session, user: userData } : null,
    // updateProfile: updateProfileFunction, // Pass if defined
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
    throw new Error(
      "useSession must be used within a ProCustomer SessionProvider",
    );
  }
  return context;
}

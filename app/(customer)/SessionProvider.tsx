// app/(customer)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";
// Import Prisma types ONLY if needed for casting/comparison, otherwise define locally
// import { Tier } from "@prisma/client";

// --- Define UserRole INCLUDING MANAGER ---
// This type is LOCAL to the customer context
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER"; // Include all possible roles from Prisma for type compatibility

// Define the SessionUser type - Fields exposed to CUSTOMER client components
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  postcode: string; // Customer might need this
  country: string; // Customer might need this
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole; // Uses the UserRole type defined above
  // ** tier is NOT included here **
}

// Extend Lucia's Session type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the type for allowed updates for THIS provider
type CustomerProfileUpdates = {
  avatarUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  // Add other customer-updatable fields here if needed later
};

// Updated context interface
interface SessionContext {
  user: SessionUser | null;
  session: SessionWithUser | null;
  updateProfile: (updates: CustomerProfileUpdates) => void; // Use specific update type
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    user: SessionUser | null; // Expects the SessionUser defined above
    session: LuciaSession | null;
  };
}) {
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  // Sync state if the initial value prop changes
  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  // Update function specific to customer profile (only images for now)
  const updateProfile = (updates: CustomerProfileUpdates) => {
    setUserData((prevUser) => {
      if (!prevUser) return null;
      // Merge only the allowed updates
      return {
        ...prevUser,
        ...updates,
      };
    });
  };

  const sessionValue: SessionContext = {
    user: userData,
    session:
      value.session && userData ? { ...value.session, user: userData } : null,
    updateProfile,
  };

  return (
    <SessionContext.Provider value={sessionValue}>
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

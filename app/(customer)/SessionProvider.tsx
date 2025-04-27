// app/(customer)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";
import { Tier } from "@prisma/client"; // <<< Import Tier enum

// Define UserRole (ensure it's comprehensive if needed across customer context)
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER";

// --- Updated SessionUser Interface ---
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  postcode: string; // Already present
  country: string; // Already present
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
  tier: Tier;
  phoneNumber?: string | null; // Already optional

  // --- ADDED Optional Fields needed by settings forms ---
  streetAddress?: string | null;
  suburb?: string | null; // Represents Apt/Suite in forms
  townCity?: string | null;
  // Ensure these fields are actually being fetched and passed in layout.tsx
  // --- END Add Optional Fields ---
}
// --- END OF CHANGE ---

// SessionWithUser (no changes needed)
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the type for allowed updates for THIS provider
// Now includes the optional address fields
type CustomerProfileUpdates = Partial<Omit<SessionUser, "id" | "role">>;

// SessionContext interface (no changes needed in structure)
interface SessionContext {
  user: SessionUser | null;
  session: SessionWithUser | null;
  updateProfile: (updates: CustomerProfileUpdates) => void;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  // Expect the updated SessionUser type defined in this file
  value: {
    user: SessionUser | null;
    session: LuciaSession | null;
  };
}) {
  // State uses updated SessionUser type
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  useEffect(() => {
    // Ensure incoming value.user conforms to updated type
    setUserData(value.user);
  }, [value.user]);

  // updateProfile function implementation
  const updateProfile = (updates: CustomerProfileUpdates) => {
    setUserData((prevUser) => {
      if (!prevUser) return null;
      // Create a new user object with updates applied
      const updatedUser = { ...prevUser, ...updates };
      return updatedUser;
    });
  };

  const sessionValue: SessionContext = {
    user: userData,
    session:
      value.session && userData ? { ...value.session, user: userData } : null,
    updateProfile, // Provide the update function
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
    throw new Error(
      "useSession (Customer) must be used within its specific SessionProvider",
    );
  }
  return context;
}

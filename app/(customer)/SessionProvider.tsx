// app/(customer)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";

// Define UserRole (ensure it's comprehensive if needed across customer context)
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER";

// SessionUser type (should already include postcode and country)
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  postcode: string; // <<< Already here
  country: string; // <<< Already here
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
  phoneNumber?: string | null;
}

// SessionWithUser (no changes needed)
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// --- MODIFIED CustomerProfileUpdates type ---
// Define the type for allowed updates for THIS provider
// ADD country and postcode
type CustomerProfileUpdates = {
  avatarUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  displayName?: string | undefined;
  username?: string | undefined;
  email?: string | undefined;
  phoneNumber?: string | null | undefined;
  postcode?: string | undefined; // <<< ADDED
  country?: string | undefined; // <<< ADDED
};
// --- END MODIFICATION ---

// SessionContext interface (no changes needed)
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
  value: {
    user: SessionUser | null;
    session: LuciaSession | null;
  };
}) {
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  // updateProfile function remains the same, it merges any valid keys
  const updateProfile = (updates: CustomerProfileUpdates) => {
    setUserData((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...updates };
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

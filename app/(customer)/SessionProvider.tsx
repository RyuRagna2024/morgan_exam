// app/(customer)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";

// Define UserRole including MANAGER if needed elsewhere in customer context (unlikely but safe)
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER";

// UPDATE SessionUser to include potentially needed fields client-side
export interface SessionUser {
  id: string;
  username: string; // Already exists
  firstName: string;
  lastName: string;
  displayName: string;
  email: string; // Already exists
  postcode: string; // Keep if used for shipping defaults etc.
  country: string; // Keep if used for shipping defaults etc.
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
  phoneNumber?: string | null; // <<< ADDED phoneNumber (optional)
  // NOTE: Address fields are generally NOT added here to avoid bloating the session.
  // Fetch address details specifically when needed (e.g., checkout page).
}

// Extend Lucia's Session type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// UPDATE CustomerProfileUpdates type
type CustomerProfileUpdates = {
  avatarUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  displayName?: string | undefined;
  username?: string | undefined; // <<< ADDED username
  email?: string | undefined; // <<< ADDED email
  phoneNumber?: string | null | undefined; // <<< ADDED phoneNumber (allow null)
  // NOTE: Address fields are NOT added here, as they aren't in SessionUser
};

// Updated context interface
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

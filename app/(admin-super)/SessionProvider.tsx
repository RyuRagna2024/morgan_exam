// app/(admin-super)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";

// --- Define UserRole enum (Include ALL roles & EXPORT IT) ---
export type UserRole = // <<< EXPORT ADDED

    | "USER"
    | "CUSTOMER"
    | "PROCUSTOMER"
    | "EDITOR"
    | "ADMIN"
    | "SUPERADMIN"
    | "MANAGER";

// Define the SessionUser type specific to SUPER ADMIN context
export interface SessionUser {
  // Keep exported
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole; // Use the exported UserRole type
}

// Extend Lucia's Session type with the SUPER ADMIN SessionUser type
export interface SessionWithUser extends LuciaSession {
  // Keep exported
  user: SessionUser;
}

// Define the context interface for SUPER ADMIN context
interface SessionContext {
  user: SessionUser | null;
  session: SessionWithUser | null;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    user: SessionUser | null; // Expect the specific SessionUser (or null)
    session: LuciaSession | null;
  };
}) {
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  const sessionContextValue: SessionContext = {
    user: userData,
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
  // Keep exported
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSession must be used within a SuperAdmin SessionProvider",
    );
  }
  return context;
}

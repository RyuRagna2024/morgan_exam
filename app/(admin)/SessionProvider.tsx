// app/(admin)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";
import { logout } from "../(auth)/actions"; // Ensure this path is correct

// --- Define UserRole enum (Include ALL roles & EXPORT IT) ---
export type UserRole = // <<< EXPORT ADDED

    | "USER"
    | "CUSTOMER"
    | "PROCUSTOMER"
    | "EDITOR"
    | "ADMIN"
    | "SUPERADMIN"
    | "MANAGER";

// Define the SessionUser type specific to ADMIN context
export interface SessionUser {
  // Keep export
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole; // Uses the exported UserRole type
}

// Extend Lucia's Session type with the ADMIN SessionUser type
export interface SessionWithUser extends LuciaSession {
  // Keep export
  user: SessionUser;
}

// Define the context interface for ADMIN context
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
    user: SessionUser | null;
    session: LuciaSession | null;
  };
}) {
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
    }, 7200000); // 2 hours
    return () => clearTimeout(timer);
  }, []);

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

export function useSession() {
  // Keep export
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within an Admin SessionProvider");
  }
  return context;
}

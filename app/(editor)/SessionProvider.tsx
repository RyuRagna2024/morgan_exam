// app/(editor)/SessionProvider.tsx
"use client";

import React, { createContext, useContext } from "react";
import { Session as LuciaSession } from "lucia";

// --- Define the UserRole enum to INCLUDE MANAGER ---
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER"; // <<< ADDED MANAGER HERE
// --- END CHANGE ---

// Define the SessionUser type with only the safe fields we want to expose
export interface SessionUser {
  id: string;
  username: string;
  firstName: string; // Added based on layout usage
  lastName: string; // Added based on layout usage
  displayName: string;
  postcode?: string; // Keep optional if not always needed by editor
  country?: string; // Keep optional
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole; // Uses the updated UserRole type
}

// Extend Lucia's Session type with our user type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the context interface
interface SessionContext {
  user: SessionUser | null; // Allow null initially
  session: SessionWithUser | null; // Allow null initially
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  // Expect value.user to conform to updated SessionUser
  value: {
    user: SessionUser | null; // Allow null
    session: LuciaSession | null; // Allow null
  };
}) {
  // Transform the value to match our SessionContext type
  // Handle cases where user or session might be null if needed by components
  const sessionValue: SessionContext = {
    user: value.user,
    session:
      value.session && value.user
        ? { ...value.session, user: value.user }
        : null,
  };

  return (
    <SessionContext.Provider value={sessionValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSession (Editor) must be used within its specific SessionProvider",
    );
  }
  // It's possible user/session could be null if validateRequest fails, handle downstream
  return context;
}

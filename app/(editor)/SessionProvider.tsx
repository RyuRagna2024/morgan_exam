// app/(editor)/SessionProvider.tsx

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Session as LuciaSession } from "lucia";
// Import necessary types, maybe only need basic ones here
import { UserRole as PrismaUserRole, Tier as PrismaTier } from "@prisma/client";

// Define Editor-specific UserRole subset if desired, or use full enum
// Using full enum might be simpler if shared components are used
export type UserRole = PrismaUserRole;
export type Tier = PrismaTier;

// Define the SessionUser type needed *within* the editor context
// Include only fields the editor components actually need
export interface SessionUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole; // Use the imported full enum
  // Add other fields if editor components need them (e.g., username, email)
}

// Extend Lucia's Session type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the context interface
interface SessionContext {
  user: SessionUser | null;
  session: SessionWithUser | null;
  // No updateProfile needed usually for editor context provided from layout
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
  // Basic provider, just passing down the value received from the layout
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

// Hook specific to this editor context
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSession (Editor) must be used within Editor SessionProvider",
    );
  }
  return context;
}

// src/app/SessionProvider.tsx (Adjust path if needed)
"use client";

import React, { createContext, useContext, useState } from "react";
import { Session as LuciaSession } from "lucia";

// Define the UserRole enum to match Prisma
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN";

// Define the SessionUser type with only the safe fields we want to expose
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string; // <-- Add email here
  postcode: string;
  country: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
  // Add other fields you want available in the client-side session context
  // Tier might not be needed client-side unless you use it for UI logic
}

// Extend Lucia's Session type with our user type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Updated context interface with profile update function
interface SessionContext {
  user: SessionUser | null; // Allow user to be null initially
  session: SessionWithUser | null; // Allow session to be null initially
  updateProfile: (updates: {
    avatarUrl?: string;
    backgroundUrl?: string;
  }) => void;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    // Type for the initial value prop
    user: SessionUser | null; // Allow null here too
    session: LuciaSession | null; // Allow null
  };
}) {
  // Initialize state with the provided value, allowing null
  const [userData, setUserData] = useState<SessionUser | null>(value.user);

  // Updated function to handle both avatar and background updates
  const updateProfile = (updates: {
    avatarUrl?: string;
    backgroundUrl?: string;
  }) => {
    setUserData((prevUser) => {
      if (!prevUser) return null; // Handle case where user might be null
      return {
        ...prevUser,
        ...updates, // Apply updates
      };
    });
  };

  // Construct the session value, handling potential nulls
  const sessionValue: SessionContext = {
    user: userData,
    session:
      value.session && userData
        ? { ...value.session, user: userData } // Only create SessionWithUser if both exist
        : null,
    updateProfile,
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
    throw new Error("useSession must be used within a SessionProvider");
  }
  // It's generally safer to return the context directly and let components handle null user/session
  return context;
}

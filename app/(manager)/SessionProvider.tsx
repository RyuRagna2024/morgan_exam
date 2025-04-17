// app/(manager)/SessionProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react"; // Added useEffect
import { Session as LuciaSession } from "lucia";

// Define the UserRole enum to match Prisma INCLUDING MANAGER
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "SUPERADMIN"
  | "MANAGER";

// Define the SessionUser type
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
  // Add/remove fields as needed client-side
}

// Extend Lucia's Session type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// --- MODIFICATION START ---
// Define the type for allowed updates (partial SessionUser, but only fields we want client-updatable)
type ProfileUpdates = Partial<
  Pick<
    SessionUser,
    "avatarUrl" | "backgroundUrl" | "firstName" | "lastName" | "displayName"
    // Add other fields here if they become editable and need client-side updates
  >
>;

// Updated context interface
interface SessionContext {
  user: SessionUser | null;
  session: SessionWithUser | null;
  updateProfile: (updates: ProfileUpdates) => void; // Use the new ProfileUpdates type
}
// --- MODIFICATION END ---

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

  // --- Sync with initial prop value changes (optional but good practice) ---
  useEffect(() => {
    setUserData(value.user);
  }, [value.user]);

  // --- MODIFIED updateProfile function ---
  // Accepts the ProfileUpdates type
  const updateProfile = (updates: ProfileUpdates) => {
    setUserData((prevUser) => {
      if (!prevUser) return null;
      // Merge previous user data with the allowed updates
      return {
        ...prevUser,
        ...updates,
      };
    });
  };
  // --- END MODIFICATION ---

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

// Keep the useSession hook
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

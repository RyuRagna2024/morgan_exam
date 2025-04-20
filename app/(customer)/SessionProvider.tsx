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

// --- ** ADD Tier field TO SessionUser INTERFACE ** ---
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  postcode: string;
  country: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
  tier: Tier; // <<< ADDED tier field
  phoneNumber?: string | null;
}
// --- ** END OF CHANGE ** ---

// SessionWithUser (no changes needed)
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the type for allowed updates for THIS provider
// Add tier if you ever needed to update it client-side via this context (unlikely)
type CustomerProfileUpdates = Partial<Omit<SessionUser, "id" | "role">>; // Allow updates for most fields

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

  // updateProfile function remains the same
  const updateProfile = (updates: CustomerProfileUpdates) => {
    setUserData((prevUser) => {
      if (!prevUser) return null;
      // Ensure only valid fields are updated
      const validUpdates: Partial<SessionUser> = {};
      for (const key in updates) {
        if (key !== "id" && key !== "role" && key in prevUser) {
          (validUpdates as any)[key] = (updates as any)[key];
        }
      }
      return { ...prevUser, ...validUpdates };
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
    throw new Error(
      "useSession (Customer) must be used within its specific SessionProvider",
    );
  }
  return context;
}

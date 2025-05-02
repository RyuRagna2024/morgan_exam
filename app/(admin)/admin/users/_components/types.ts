// app/(admin)/admin/users/_components/types.ts

// Import the UserRole enum directly from Prisma where it's fully defined (including MANAGER)
import { UserRole } from "@prisma/client";

/**
 * User interface that aligns with the structure returned by the getAllUsers action.
 * It uses the UserRole enum imported from Prisma.
 */
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber?: string; // Already optional in schema
  streetAddress: string;
  suburb?: string | null; // Matches schema (optional string)
  townCity: string;
  postcode: string;
  country: string;
  avatarUrl?: string | null; // Matches schema (optional string)
  role: UserRole; // Uses the complete UserRole enum from Prisma
  agreeTerms: boolean; // Included as it was in getAllUsers select
  // Note: Fields like 'passwordHash', 'backgroundUrl', relations etc.,
  // are typically not included here unless specifically needed by the component.
}

/**
 * Props for the AdminUsersTable component.
 */
export interface AdminUsersTableProps {
  users: User[]; // Expects an array of the User type defined above
}

/**
 * Generic response structure for server actions.
 * Can include success status, messages, errors, or updated data.
 */
export interface ServerActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
  users?: User[]; // Optional: Might return updated user list
  // Add other specific data fields if needed by actions
}

/**
 * Specific response structure for the getAllUsers server action.
 */
export interface GetAllUsersResponse {
  users?: User[]; // An array of users
  error?: string; // Error message if fetching failed
}

/**
 * Defines the expected structure for data used when updating a user's role.
 */
export interface RoleUpdateData {
  userId: string;
  newRole: UserRole; // Ensures the role being sent matches the Prisma enum
}

/**
 * Represents a partial User object, typically used for update operations
 * where only some fields might be changed.
 */
export type UserUpdate = Partial<User>;

// You can add other specific types needed for your user management components here.

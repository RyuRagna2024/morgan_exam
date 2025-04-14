import { UserRole } from "@prisma/client";

/**
 * User interface that matches the Prisma User model
 */
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  streetAddress: string;
  suburb?: string | null; // Updated to accept null
  townCity: string;
  postcode: string;
  country: string;
  avatarUrl?: string | null; // Already supports null
  backgroundUrl?: string | null; // Already supports null
  agreeTerms: boolean;
  role: UserRole;
}

/**
 * Props for the AdminUsersTable component
 */
export interface AdminUsersTableProps {
  users: User[];
}

/**
 * Response from server actions
 */
export interface ServerActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
  users?: User[];
}

/**
 * Response specifically for the getAllUsers action
 */
export interface GetAllUsersResponse {
  users?: User[];
  error?: string;
}

/**
 * Form data structure for role update
 */
export interface RoleUpdateData {
  userId: string;
  newRole: UserRole;
}

/**
 * User with partial properties that can be updated
 */
export type UserUpdate = Partial<User>;

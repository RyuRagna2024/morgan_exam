"use server";

import { validateRequest } from "@/auth";
import { UserRole } from "@prisma/client";

/**
 * Helper function to verify admin permissions
 * Can be imported by all admin action files
 */
export async function verifyAdminPermissions() {
  const { user, session } = await validateRequest();

  // Check if user is authenticated
  if (!user || !session) {
    throw new Error("Authentication required");
  }

  // Check if user has admin or superadmin role
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
    throw new Error("Insufficient permissions");
  }

  return user;
}

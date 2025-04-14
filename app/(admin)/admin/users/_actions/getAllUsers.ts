"use server";

import prisma from "@/lib/prisma";
import { verifyAdminPermissions } from "./verifyAdminPermissions";

/**
 * Fetches all users from the database
 * Only accessible to ADMIN and SUPERADMIN users
 */
export async function getAllUsers() {
  try {
    // Verify admin permissions
    const adminUser = await verifyAdminPermissions();

    // Fetch all users, ordering by role and then by name
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        phoneNumber: true,
        streetAddress: true,
        suburb: true,
        townCity: true,
        postcode: true,
        country: true,
        avatarUrl: true,
        role: true,
        agreeTerms: true,
        // Exclude sensitive data like passwordHash
      },
      orderBy: [{ role: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    });

    // Log the admin action
    console.log(`Admin ${adminUser.email} (${adminUser.id}) fetched all users`);

    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Failed to fetch users" };
  }
}

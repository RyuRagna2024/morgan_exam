"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { verifyAdminPermissions } from "./verifyAdminPermissions";

// Role update schema
const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.nativeEnum(UserRole),
});

/**
 * Updates a user's role
 * Only accessible to ADMIN and SUPERADMIN users
 * Note: SUPERADMIN role can only be assigned by another SUPERADMIN
 */
export async function updateUserRole(formData: FormData) {
  try {
    // Verify admin permissions
    const adminUser = await verifyAdminPermissions();

    // Parse and validate input
    const userId = formData.get("userId") as string;
    const newRole = formData.get("newRole") as UserRole;

    const validatedData = updateRoleSchema.parse({ userId, newRole });

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return { error: "User not found" };
    }

    // Special permission check for SUPERADMIN role
    if (
      validatedData.newRole === UserRole.SUPERADMIN &&
      adminUser.role !== UserRole.SUPERADMIN
    ) {
      return { error: "Only SUPERADMIN users can assign the SUPERADMIN role" };
    }

    // Prevent SUPERADMIN from being downgraded by non-SUPERADMIN
    if (
      targetUser.role === UserRole.SUPERADMIN &&
      adminUser.role !== UserRole.SUPERADMIN
    ) {
      return { error: "Cannot modify a SUPERADMIN user's role" };
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: { role: validatedData.newRole },
      select: { id: true, email: true, role: true },
    });

    // Log the admin action
    console.log(
      `Admin ${adminUser.email} (${adminUser.id}) updated role for user ${updatedUser.email} (${updatedUser.id}) to ${updatedUser.role}`,
    );

    // Revalidate the users page to reflect changes
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `Updated ${updatedUser.email}'s role to ${updatedUser.role}`,
    };
  } catch (error) {
    console.error("Error updating user role:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Failed to update user role" };
  }
}

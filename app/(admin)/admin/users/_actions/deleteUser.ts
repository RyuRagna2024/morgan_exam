"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Deletes a user
 * Only accessible to ADMIN and SUPERADMIN users
 */
export async function deleteUser(formData: FormData) {
  try {
    // Verify admin permissions
    const { user, session } = await validateRequest();

    // Check if user is authenticated
    if (!user || !session) {
      return { error: "Authentication required" };
    }

    // Check if user has admin or superadmin role
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPERADMIN) {
      return { error: "Insufficient permissions" };
    }

    const userId = formData.get("userId") as string;

    if (!userId || typeof userId !== "string") {
      return { error: "Invalid user ID" };
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return { error: "User not found" };
    }

    // Prevent regular ADMIN from deleting ADMIN or SUPERADMIN
    if (
      user.role === UserRole.ADMIN &&
      (targetUser.role === UserRole.ADMIN ||
        targetUser.role === UserRole.SUPERADMIN)
    ) {
      return { error: "You cannot delete admin or superadmin users" };
    }

    // Prevent SUPERADMIN from being deleted by anyone except another SUPERADMIN
    if (
      targetUser.role === UserRole.SUPERADMIN &&
      user.role !== UserRole.SUPERADMIN
    ) {
      return { error: "Only superadmin can delete another superadmin" };
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate the users page to reflect changes
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `Deleted user ${targetUser.email}`,
    };
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Failed to delete user" };
  }
}

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

// Enum matching your Prisma schema
enum UserRole {
  USER = "USER",
  CUSTOMER = "CUSTOMER",
  PROCUSTOMER = "PROCUSTOMER",
  EDITOR = "EDITOR",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
  MANAGER = "MANAGER",
}

// Define role-based routing
const roleRoutes: Record<UserRole, string> = {
  [UserRole.USER]: "/register-success",
  [UserRole.CUSTOMER]: "/",
  [UserRole.PROCUSTOMER]: "/pro",
  [UserRole.EDITOR]: "/",
  [UserRole.ADMIN]: "/admin",
  [UserRole.SUPERADMIN]: "/super-admin",
  [UserRole.MANAGER]: "/manager",
};

function toUserRole(role: string): UserRole | undefined {
  return Object.values(UserRole).includes(role as UserRole)
    ? (role as UserRole)
    : undefined;
}

export default async function RoleBasedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) {
    const userRole = toUserRole(user.role);

    if (userRole && userRole in roleRoutes) {
      redirect(roleRoutes[userRole]);
    } else {
      console.warn(`Unrecognized user role: ${user.role}`);
      redirect("/");
    }
  }

  return (
    <>
      <Toaster />
      {children}
    </>
  );
}

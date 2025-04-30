// app/(customer)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider, { SessionUser } from "./SessionProvider"; // <<< Ensure SessionUser includes all fields
import { Toaster } from "react-hot-toast";
import { UserRole as PrismaUserRole, Tier as PrismaTier } from "@prisma/client";
import CustomerSidebar from "./_components/CustomerSidebar";
import MainContentHeader from "./_components/MainContentHeader";
import { getCustomerOrderCount } from "./_components/(sidebar)/_profile-actions/count-orders";
import { getCustomerWishlistCount } from "./_components/(sidebar)/_profile-actions/count-wishlist";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: fullUser, session } = await validateRequest();

  if (
    !fullUser ||
    !session ||
    (fullUser.role !== PrismaUserRole.CUSTOMER &&
      fullUser.role !== PrismaUserRole.PROCUSTOMER)
  ) {
    return redirect("/");
  }

  // Prepare SessionUser - ENSURE ALL FIELDS ARE MAPPED
  const sessionUser: SessionUser = {
    id: fullUser.id,
    username: fullUser.username,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    displayName: fullUser.displayName,
    email: fullUser.email,
    postcode: fullUser.postcode, // Already present
    country: fullUser.country, // Already present
    avatarUrl: fullUser.avatarUrl ?? null,
    backgroundUrl: fullUser.backgroundUrl ?? null,
    role: fullUser.role as SessionUser["role"],
    tier: fullUser.tier,
    phoneNumber: fullUser.phoneNumber ?? null, // Already present

    // --- ADDED/VERIFIED MAPPINGS ---
    streetAddress: fullUser.streetAddress ?? null, // Ensure this exists on fullUser
    suburb: fullUser.suburb ?? null, // Ensure this exists on fullUser
    townCity: fullUser.townCity ?? null, // Ensure this exists on fullUser
    // --- END ADDED/VERIFIED ---
  };

  // Fetch counts (rest of the component remains the same)
  const [orderCountResponse, wishlistCountResponse] = await Promise.all([
    getCustomerOrderCount(),
    getCustomerWishlistCount(),
  ]);
  const orderCount = orderCountResponse.success
    ? orderCountResponse.totalOrders || 0
    : 0;
  const wishlistCount = wishlistCountResponse.success
    ? wishlistCountResponse.wishlistItemCount || 0
    : 0;

  return (
    <SessionProvider value={{ user: sessionUser, session: session }}>
      <Toaster position="top-right" />
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <CustomerSidebar
          user={sessionUser}
          orderCount={orderCount}
          wishlistCount={wishlistCount}
        />
        <div className="flex flex-1 flex-col">
          <MainContentHeader />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

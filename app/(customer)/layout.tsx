// app/(customer)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
// Import SessionProvider AND SessionUser type from THIS directory's provider
import SessionProvider, { SessionUser } from "./SessionProvider"; // <<< Uses ./SessionProvider
import { Toaster } from "react-hot-toast";
import { UserRole as PrismaUserRole, Tier as PrismaTier } from "@prisma/client"; // Use alias for Prisma enums
import Navbar from "./_components/Navbar";
import CustomerSidebar from "./_components/CustomerSidebar";
import { getCustomerOrderCount } from "./_components/(sidebar)/_profile-actions/count-orders";
import { getCustomerWishlistCount } from "./_components/(sidebar)/_profile-actions/count-wishlist";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch full user data and session from auth
  // Assuming validateRequest returns the full user object including tier
  const { user: fullUser, session } = await validateRequest();

  // Authentication and Authorization check
  if (!fullUser || !session || fullUser.role !== PrismaUserRole.CUSTOMER) {
    return redirect("/");
  }

  // --- Create the client-safe SessionUser object INCLUDING TIER ---
  const sessionUser: SessionUser = {
    id: fullUser.id,
    username: fullUser.username,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    displayName: fullUser.displayName,
    email: fullUser.email,
    postcode: fullUser.postcode,
    country: fullUser.country,
    avatarUrl: fullUser.avatarUrl ?? null,
    backgroundUrl: fullUser.backgroundUrl ?? null,
    // Cast role, ensure SessionUser['role'] includes all PrismaUserRole values if needed
    role: fullUser.role as SessionUser["role"],
    tier: fullUser.tier, // <<< ADDED tier field (Type should match SessionUser.tier -> PrismaTier)
    phoneNumber: fullUser.phoneNumber ?? null, // Add phone if needed by SessionUser
  };

  // Fetch order and wishlist counts
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

  const navbarHeightDesktop = 88; // Example: Replace with actual desktop height
  const navbarHeightMobile = 88; // Example: Replace with actual mobile height

  return (
    // Use the Customer SessionProvider from this directory
    <SessionProvider value={{ user: sessionUser, session: session }}>
      <Toaster
        position="top-center"
        containerStyle={{ top: navbarHeightDesktop + 16 }}
        toastOptions={
          {
            /* ... your options ... */
          }
        }
      />

      <div className="flex flex-col min-h-screen">
        {/* Fixed Navbar Wrapper */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar /> {/* This Navbar will use the Customer SessionProvider */}
        </div>

        {/* Spacers */}
        <div className={`block md:hidden h-[${navbarHeightMobile}px]`} />
        <div className={`hidden md:block h-[${navbarHeightDesktop}px]`} />

        {/* Container for Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex h-full">
            <CustomerSidebar
              user={sessionUser} // Pass the user data with tier
              orderCount={orderCount}
              wishlistCount={wishlistCount}
            />
          </div>
          {/* Main Content Area */}
          <main className="flex-grow p-6 bg-slate-100 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

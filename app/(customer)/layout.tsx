// app/(customer)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider, { SessionUser } from "./SessionProvider";
import { Toaster } from "react-hot-toast"; // Or use Sonner if preferred globally
import { UserRole as PrismaUserRole, Tier as PrismaTier } from "@prisma/client";
// Navbar removed
import CustomerSidebar from "./_components/CustomerSidebar"; // Keep Sidebar
import MainContentHeader from "./_components/MainContentHeader"; // <<< Import NEW Header
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

  // Auth check (allow CUSTOMER or PROCUSTOMER)
  if (!fullUser || !session || (fullUser.role !== PrismaUserRole.CUSTOMER && fullUser.role !== PrismaUserRole.PROCUSTOMER)) {
    return redirect("/");
  }

  // Prepare SessionUser
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
    role: fullUser.role as SessionUser["role"],
    tier: fullUser.tier,
    phoneNumber: fullUser.phoneNumber ?? null,
  };

  // Fetch counts
  const [orderCountResponse, wishlistCountResponse] = await Promise.all([
    getCustomerOrderCount(),
    getCustomerWishlistCount(),
  ]);
  const orderCount = orderCountResponse.success ? orderCountResponse.totalOrders || 0 : 0;
  const wishlistCount = wishlistCountResponse.success ? wishlistCountResponse.wishlistItemCount || 0 : 0;

  return (
    <SessionProvider value={{ user: sessionUser, session: session }}>
      <Toaster position="top-right" /> {/* Adjusted position */}

      {/* Main Full Height Flex Container */}
      {/* Keep overflow hidden at the root level */}
      <div className="flex h-screen bg-background text-foreground overflow-hidden">

        {/* Sidebar (Fixed Width, Full Height) */}
        {/* Sidebar manages its own width and internal scrolling */}
        <CustomerSidebar
          user={sessionUser}
          orderCount={orderCount}
          wishlistCount={wishlistCount}
        />

        {/* Main Content Area Wrapper */}
        {/* Removed overflow-hidden from this immediate parent */}
        <div className="flex flex-1 flex-col"> {/* No overflow-hidden here */}

          {/* Header WITHIN Main Content Area */}
          {/* This header scrolls with the main content area */}
          <MainContentHeader />

          {/* Scrollable Main Content */}
          {/* flex-1 takes remaining height, overflow-y-auto enables scroll */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/40"> {/* Use theme background */}
            {children}
          </main>
        </div>
        {/* --- End Main Content Area --- */}

      </div>
      {/* --- End Main Flex Container --- */}
    </SessionProvider>
  );
}
// app/(customer)/layout.tsx
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
// Import SessionProvider AND SessionUser type from THIS directory's provider
import SessionProvider, { SessionUser } from "./SessionProvider";
import { Toaster } from "react-hot-toast"; // Using react-hot-toast as per original
import { UserRole as PrismaUserRole } from "@prisma/client"; // Use alias for Prisma enum
import Navbar from "./_components/Navbar"; // Assuming Navbar is specific to customer
import CustomerSidebar from "./_components/CustomerSidebar"; // Import CustomerSidebar
import { getCustomerOrderCount } from "./_components/(sidebar)/_profile-actions/count-orders"; // Adjust path if needed
import { getCustomerWishlistCount } from "./_components/(sidebar)/_profile-actions/count-wishlist"; // Adjust path if needed

// Recommended for pages fetching dynamic data
export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch full user data and session from auth
  const { user: fullUser, session } = await validateRequest();

  // Authentication and Authorization check
  if (!fullUser || !session || fullUser.role !== PrismaUserRole.CUSTOMER) {
    // Redirect if not logged in or not a customer
    return redirect("/"); // Redirect to home or login page
  }

  // --- Create the client-safe SessionUser object ---
  const sessionUser: SessionUser = {
    id: fullUser.id,
    username: fullUser.username,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    displayName: fullUser.displayName,
    email: fullUser.email,
    postcode: fullUser.postcode,
    country: fullUser.country,
    avatarUrl: fullUser.avatarUrl,
    backgroundUrl: fullUser.backgroundUrl,
    role: fullUser.role as SessionUser["role"],
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

  // --- !!! IMPORTANT: Determine Navbar Height !!! ---
  // Inspect your Customer Navbar component in the browser dev tools
  // Replace these example values with the ACTUAL computed height in pixels
  const navbarHeightDesktop = 88; // Example: Replace with actual desktop height
  const navbarHeightMobile = 88; // Example: Replace with actual mobile height (might be different)

  return (
    <SessionProvider value={{ user: sessionUser, session: session }}>
      <Toaster
        position="top-center"
        containerStyle={{ top: navbarHeightDesktop + 16 }} // Position below desktop navbar
        toastOptions={
          {
            /* ... your options ... */
          }
        }
      />

      <div className="flex flex-col min-h-screen">
        {/* Fixed Navbar Wrapper */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        {/* --- SPACER DIVs using Tailwind arbitrary values --- */}
        {/* Spacer for mobile */}
        <div className={`block md:hidden h-[${navbarHeightMobile}px]`} />
        {/* Spacer for desktop */}
        <div className={`hidden md:block h-[${navbarHeightDesktop}px]`} />

        {/* Container for Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex h-full">
            <CustomerSidebar
              user={sessionUser}
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

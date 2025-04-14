import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import { Toaster } from "react-hot-toast"; // Keep this import
import { UserRole } from "@prisma/client";
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
  const session = await validateRequest();

  if (!session.user || session.user.role !== UserRole.CUSTOMER) {
    redirect("/");
  }

  // Get the order count and wishlist count in parallel
  const [orderCountResponse, wishlistCountResponse] = await Promise.all([
    getCustomerOrderCount(),
    getCustomerWishlistCount(),
  ]);

  // Extract the counts or use 0 as fallback
  const orderCount = orderCountResponse.success
    ? orderCountResponse.totalOrders || 0
    : 0;

  const wishlistCount = wishlistCountResponse.success
    ? wishlistCountResponse.wishlistItemCount || 0
    : 0;

  return (
    <SessionProvider value={session}>
      {/* --- CONFIGURED TOASTER --- */}
      <Toaster
        position="top-center" // Keep toasts centered horizontally
        containerStyle={{
          top: 80, // Navbar height (64px from pt-16) + 16px spacing = 80px from the top
        }}
        toastOptions={{
          // Default options for all toasts
          duration: 3000, // Default duration in ms
          style: {
            background: "#374151", // Example: bg-gray-700
            color: "#ffffff", // Example: text-white
            fontSize: "14px", // Adjust font size if needed
            padding: "12px 16px", // Adjust padding
          },
          // Default options for specific types
          success: {
            duration: 2500, // Auto-close success toasts after 2.5s (overlaps with your 2s redirect)
            // You could define specific success styling here if needed
            // style: { background: 'green' }
            // iconTheme: { primary: '#10B981', secondary: 'white' }, // Example: Emerald icon
          },
          error: {
            duration: 4000, // Give more time to read errors
            // style: { background: '#EF4444', color: 'white' }, // Example: bg-red-500
          },
        }}
      />
      {/* --- END TOASTER CONFIG --- */}

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex">
          <CustomerSidebar
            user={session.user}
            orderCount={orderCount}
            wishlistCount={wishlistCount}
          />
          {/* Adjusted ml-* based on CustomerSidebar width if necessary */}
          <main className="flex-grow p-6 ml-64 transition-all duration-300 bg-slate-100 min-h-screen pt-16">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

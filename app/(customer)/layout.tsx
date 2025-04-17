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
  // Include ONLY the fields defined in app/(customer)/SessionProvider.tsx SessionUser interface
  const sessionUser: SessionUser = {
    id: fullUser.id,
    username: fullUser.username,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    displayName: fullUser.displayName,
    email: fullUser.email,
    // Include postcode and country if they are DEFINED in the customer SessionUser interface
    postcode: fullUser.postcode,
    country: fullUser.country,
    avatarUrl: fullUser.avatarUrl,
    backgroundUrl: fullUser.backgroundUrl,
    // Cast the role from Prisma's enum to the SessionProvider's defined type
    role: fullUser.role as SessionUser["role"],
    // ** NOTE: tier is intentionally omitted here to match CustomerSessionProvider **
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

  return (
    // Provide the session context using the customer-specific SessionProvider
    // Pass the correctly typed sessionUser object to the 'value' prop
    <SessionProvider value={{ user: sessionUser, session: session }}>
      {/* Configure react-hot-toast */}
      <Toaster
        position="top-center"
        containerStyle={{ top: 80 }} // Adjust based on actual Navbar height
        toastOptions={{
          duration: 3000,
          style: {
            background: "#374151",
            color: "#ffffff",
            fontSize: "14px",
            padding: "12px 16px",
          },
          success: { duration: 2500 },
          error: { duration: 4000 },
        }}
      />

      {/* Main layout structure */}
      <div className="flex flex-col min-h-screen">
        {/* Customer specific Navbar */}
        <Navbar />
        {/* Container for Sidebar + Main Content */}
        <div className="flex flex-1 pt-16 md:pt-[88px] overflow-hidden">
          {" "}
          {/* Adjust pt to match Navbar height */}
          {/* Customer specific Sidebar */}
          {/* Pass the correctly typed sessionUser object */}
          <CustomerSidebar
            user={sessionUser} // Uses the sessionUser created above
            orderCount={orderCount}
            wishlistCount={wishlistCount}
          />
          {/* Main Content Area - Adjust ml- if sidebar width changes */}
          <main className="flex-grow p-6 ml-0 md:ml-64 transition-all duration-300 bg-slate-100 overflow-y-auto">
            {" "}
            {/* Added md:ml-64 for sidebar spacing */}
            {children} {/* Render the specific customer page content */}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

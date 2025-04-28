// app/(customer)/page.tsx
import { validateRequest } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Actions ---
import {
  getCustomerOrderCount,
  getCustomerOrders,
} from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-orders";
import { getCustomerWishlistCount } from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-wishlist";
import { getCustomerSentTicketCount } from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-support-tickets"; // <<< Import new action

// --- Icons ---
import {
  ShoppingBag,
  Heart,
  Calendar,
  CreditCard,
  ArrowRightLeft,
  Mail,
  KeyRound,
  Award,
  PackageCheck,
  CircleDollarSign,
  LifeBuoy,
  MessagesSquare,
  CheckCheck,
  Banknote, // Added CheckCheck & Banknote
  LucideProps,
} from "lucide-react";
import Link from "next/link";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// --- Import TierBadge ---
import TierBadge from "@/app/(public)/_components/(navbar_group)/TierBadge";

// --- Type Definitions for Action Cards ---
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type LinkActionCard = {
  title: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href: string;
  value?: string | number;
  isTierCard?: never;
};

type TierActionCard = {
  title: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  isTierCard: true;
  value?: never;
  href?: never;
};

type ActionCardItem = LinkActionCard | TierActionCard;
// --- End Type Definitions ---

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper function to map order status to badge variant
const getStatusVariant = (
  status: string | null | undefined,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "delivered":
      return "default";
    case "pending":
    case "processing":
      return "secondary";
    case "cancelled":
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

export default async function CustomerDashboardPage() {
  const { user } = await validateRequest();

  // Fetch all necessary data
  const [
    orderCountResponse,
    wishlistCountResponse,
    ordersResponse,
    ticketCountResponse,
  ] = await Promise.all([
    getCustomerOrderCount(),
    getCustomerWishlistCount(),
    getCustomerOrders(), // Fetches all orders
    getCustomerSentTicketCount(),
  ]);

  // Process standard counts
  const orderCount = orderCountResponse.success
    ? orderCountResponse.totalOrders || 0
    : 0;
  const wishlistCount = wishlistCountResponse.success
    ? wishlistCountResponse.wishlistItemCount || 0
    : 0;
  const supportTicketsSentCount = ticketCountResponse.success
    ? ticketCountResponse.ticketCount || 0
    : 0;

  // Process all orders data
  const allOrders =
    ordersResponse.success && Array.isArray(ordersResponse.orders)
      ? ordersResponse.orders
      : [];
  const latestOrders = allOrders.slice(0, 5); // Get latest 5 for the table

  // --- Calculate Delivered Orders Count ---
  const deliveredOrdersCount = allOrders.filter(
    (order) => order.status?.toUpperCase() === "DELIVERED",
  ).length;
  // --- End Calculation ---

  // --- Calculate Total Amount Spent ---
  const totalAmountSpent = allOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0), // Add amount, default to 0 if null/undefined
    0, // Initial sum is 0
  );
  // --- End Calculation ---

  // --- Mock Data ---
  const subscriptionCount = 1;
  // const transactionsCount = 50; // Removed, replaced by delivered count
  // const creditsValue = 100; // Removed, replaced by total spent

  // --- Updated Summary Cards ---
  const summaryCards = [
    {
      title: "Total Orders",
      value: orderCount,
      icon: ShoppingBag,
      href: "/customer/orders",
    },
    {
      title: "Support Tickets Sent",
      value: supportTicketsSentCount,
      icon: LifeBuoy,
      href: "/customer/support",
    },
    {
      title: "Wishlist",
      value: wishlistCount,
      icon: Heart,
      href: "/customer/wishlist",
    },
    // --- Updated Transactions Card ---
    {
      title: "Delivered Orders",
      value: deliveredOrdersCount,
      icon: CheckCheck,
      href: "/customer/orders?status=delivered",
    }, // Updated title, value, icon, href
    // --- Updated Credits Card ---
    {
      title: "Total Amount Spent",
      value: formatCurrency(totalAmountSpent),
      icon: Banknote,
      href: "/customer/orders",
    }, // Updated title, value, icon, href
    // --- End Updates ---
    {
      title: "Subscriptions",
      value: subscriptionCount,
      icon: Calendar,
      href: "/customer/subscriptions",
    },
  ];

  // --- Action Cards (No changes needed here based on request) ---
  const rewardPoints = 0; // Example value for Reward Points card if you keep it
  const actionCards: ActionCardItem[] = [
    {
      title: "Change Password",
      icon: KeyRound,
      href: "/customer/settings?tab=security",
    },
    { title: "Order History", icon: ShoppingBag, href: "/customer/orders" },
    {
      title: "My Messages",
      icon: MessagesSquare,
      href: "/customer/mymessages",
    },
    {
      title: "Payment Details",
      icon: CreditCard,
      href: "/customer/payment-methods",
    },
    // Removed Reward Points card { title: "Reward Points", value: rewardPoints, icon: Award, href: "#" },
    { title: "Tier Status", icon: Award, isTierCard: true },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <h1 className="text-2xl font-semibold">
        Welcome back, {user?.displayName || "Customer"}!
      </h1>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
        {summaryCards.map((item, index) => (
          <Link
            href={item.href || "#"}
            key={index}
            className="block hover:shadow-md transition-shadow rounded-lg"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Action Links/Cards Grid (Smaller) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {actionCards.map((item, index) => {
          if (item.isTierCard) {
            return (
              <Card key={index}>
                <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center">
                  <item.icon className="h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-sm font-medium">{item.title}</p>
                  <TierBadge />
                </CardContent>
              </Card>
            );
          } else {
            return (
              <Link
                href={item.href}
                key={index}
                className="block hover:shadow-md transition-shadow rounded-lg"
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center">
                    <item.icon className="h-6 w-6 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.value !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {item.value}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          }
        })}
      </div>

      {/* Latest Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Orders</CardTitle>
          <CardDescription>Your 5 most recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead># of Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestOrders.length > 0 ? (
                latestOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="hover:underline text-primary"
                      >
                        #{order.id ? order.id.substring(0, 8) : "N/A"}...
                      </Link>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(order.orderItems)
                        ? order.orderItems.length
                        : 0}
                    </TableCell>
                    <TableCell>
                      <ShadcnBadge
                        variant={getStatusVariant(order.status)}
                        className="capitalize"
                      >
                        {order.status?.toLowerCase() || "unknown"}
                      </ShadcnBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "dd/MM/yyyy")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You haven&apos;t placed any orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

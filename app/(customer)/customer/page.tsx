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
import {
  getCustomerOrderCount,
  getCustomerOrders,
} from "../_components/(sidebar)/_profile-actions/count-orders"; // Use specific count action
import { getCustomerWishlistCount } from "../_components/(sidebar)/_profile-actions/count-wishlist";
import {
  ShoppingBag,
  Heart,
  Calendar,
  MessageSquare,
  CreditCard, // Corrected: Use CreditCard
  ArrowRightLeft,
  Mail,
  KeyRound,
  Award,
  PackageCheck,
  CircleDollarSign,
  LucideProps,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // For order status
import { format } from "date-fns"; // For date formatting
import { cn } from "@/lib/utils";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  // Handle potential non-numeric input gracefully, though Prisma should ensure numbers
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00"; // Or some other placeholder
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Adjust currency as needed
  }).format(amount);
};

// Helper function to map order status to badge variant
const getStatusVariant = (
  status: string | null | undefined,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "delivered":
      return "default"; // Greenish/Default
    case "pending":
    case "processing":
      return "secondary"; // Grayish
    case "cancelled":
    case "failed":
      return "destructive"; // Red
    default:
      return "outline";
  }
};

export default async function CustomerDashboardPage() {
  // Fetch user details
  const { user } = await validateRequest();

  // Fetch real data using server actions
  const [orderCountResponse, wishlistCountResponse, ordersResponse] =
    await Promise.all([
      getCustomerOrderCount(),
      getCustomerWishlistCount(),
      getCustomerOrders(), // Fetch all orders to display latest
    ]);

  const orderCount = orderCountResponse.success
    ? orderCountResponse.totalOrders || 0
    : 0;
  const wishlistCount = wishlistCountResponse.success
    ? wishlistCountResponse.wishlistItemCount || 0
    : 0;
  const latestOrders = ordersResponse.success
    ? (ordersResponse.orders || []).slice(0, 5)
    : []; // Take top 5 orders

  // --- Mock Data ---
  const messageCount = 3; // Example: 3 unread messages
  const subscriptionCount = 1; // Example: 1 active subscription
  const returnRequestsCount = 1; // Mock data from screenshot
  const transactionsCount = 50; // Mock data from screenshot
  const creditsValue = 100; // Mock data from screenshot
  const rewardPoints = 0; // Mock data

  // Structure for the summary cards (mix of real and mock)
  const summaryCards = [
    {
      title: "Total Orders",
      value: orderCount,
      icon: ShoppingBag,
      href: "/customer/orders",
    },
    {
      title: "Return Requests",
      value: returnRequestsCount,
      icon: PackageCheck,
      href: "/customer/orders?filter=returns",
    }, // Link example
    {
      title: "Wishlist",
      value: wishlistCount,
      icon: Heart,
      href: "/customer/wishlist",
    },
    {
      title: "Transactions",
      value: transactionsCount,
      icon: ArrowRightLeft,
      href: "/customer/payment-methods",
    }, // Example link
    {
      title: "Credits",
      value: formatCurrency(creditsValue),
      icon: CircleDollarSign,
      href: "#",
    }, // No link for now
    {
      title: "Subscriptions",
      value: subscriptionCount,
      icon: Calendar,
      href: "/customer/subscriptions",
    },
    // { title: "My Messages", value: messageCount, icon: MessageSquare, href: "/customer/mymessages" }, // Optional
  ];

  // Structure for smaller action cards/links
  const actionCards = [
    {
      title: "Change Password",
      icon: KeyRound,
      href: "/customer/settings?tab=password",
    }, // Example link
    { title: "Order History", icon: ShoppingBag, href: "/customer/orders" }, // Renamed from "Order"
    {
      title: "Newsletter",
      icon: Mail,
      href: "/customer/settings?tab=notifications",
    },
    {
      title: "Payment Details",
      icon: CreditCard,
      href: "/customer/payment-methods",
    }, // Corrected icon
    { title: "Reward Points", value: rewardPoints, icon: Award, href: "#" },
    // Add more based on screenshot if needed
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Welcome Header */}
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
              {" "}
              {/* Ensure cards have consistent height if needed */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                {/* Optional: Add description or subtext if needed */}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Action Links/Cards Grid (Smaller) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {actionCards.map((item, index) => (
          <Link
            href={item.href || "#"}
            key={index}
            className="block hover:shadow-md transition-shadow rounded-lg"
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center">
                <item.icon className="h-6 w-6 text-muted-foreground mb-1" />
                <p className="text-sm font-medium">{item.title}</p>
                {/* Display value only if it exists (e.g., Reward Points) */}
                {item.value !== undefined && (
                  <p className="text-xs text-muted-foreground">{item.value}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
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
                        #{order.id.substring(0, 8)}... {/* Shorten ID */}
                      </Link>
                    </TableCell>
                    <TableCell>{order.orderItems.length}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="capitalize"
                      >
                        {order.status?.toLowerCase() || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(order.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No orders found yet.
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

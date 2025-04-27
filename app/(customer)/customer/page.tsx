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
// --- USE PATH ALIASES for imports ---
import {
  getCustomerOrderCount,
  getCustomerOrders,
} from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-orders";
import { getCustomerWishlistCount } from "@/app/(customer)/_components/(sidebar)/_profile-actions/count-wishlist";
// --- End Use Path Aliases ---
import {
  ShoppingBag,
  Heart,
  Calendar,
  MessageSquare,
  CreditCard,
  ArrowRightLeft,
  Mail,
  KeyRound,
  Award,
  PackageCheck,
  CircleDollarSign,
  LucideProps,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

  const [orderCountResponse, wishlistCountResponse, ordersResponse] =
    await Promise.all([
      getCustomerOrderCount(),
      getCustomerWishlistCount(),
      getCustomerOrders(),
    ]);

  const orderCount = orderCountResponse.success
    ? orderCountResponse.totalOrders || 0
    : 0;
  const wishlistCount = wishlistCountResponse.success
    ? wishlistCountResponse.wishlistItemCount || 0
    : 0;
  // The type for latestOrders comes from the return type of getCustomerOrders
  const latestOrders =
    ordersResponse.success && Array.isArray(ordersResponse.orders)
      ? ordersResponse.orders.slice(0, 5)
      : [];

  // --- Mock Data ---
  const messageCount = 3;
  const subscriptionCount = 1;
  const returnRequestsCount = 1;
  const transactionsCount = 50;
  const creditsValue = 100;
  const rewardPoints = 0;

  // Structure for the main summary cards
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
    },
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
    },
    {
      title: "Credits",
      value: formatCurrency(creditsValue),
      icon: CircleDollarSign,
      href: "#",
    },
    {
      title: "Subscriptions",
      value: subscriptionCount,
      icon: Calendar,
      href: "/customer/subscriptions",
    },
  ];

  // Structure for smaller action cards/links
  const actionCards = [
    {
      title: "Change Password",
      icon: KeyRound,
      href: "/customer/settings?tab=security",
    },
    { title: "Order History", icon: ShoppingBag, href: "/customer/orders" },
    {
      title: "Newsletter",
      icon: Mail,
      href: "/customer/settings?tab=notifications",
    },
    {
      title: "Payment Details",
      icon: CreditCard,
      href: "/customer/payment-methods",
    },
    { title: "Reward Points", value: rewardPoints, icon: Award, href: "#" },
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
                // The type for 'order' is inferred from latestOrders array, which uses OrderWithItems type from count-orders.ts
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
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="capitalize"
                      >
                        {order.status?.toLowerCase() || "unknown"}
                      </Badge>
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

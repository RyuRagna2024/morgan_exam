// app/(customer)/orders/_components/OrderTable.tsx
"use client";
import React, { useState, useMemo } from "react";
import { formatDistance } from "date-fns";
import { OrderStatus } from "@prisma/client";
import { OrderTableProps, OrderWithItems } from "../types"; // Adjust path if needed
import OrderDetailModal from "./OrderDetailModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, type BadgeProps } from "@/components/ui/badge"; // Import BadgeProps type
import { Search, Calendar as CalendarIcon, Eye } from "lucide-react"; // Added Eye icon
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Use Card for structure

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status Badge Variants using AVAILABLE shadcn Badge component variants
  const getStatusVariant = (status: OrderStatus): BadgeProps["variant"] => {
    // Use BadgeProps['variant'] for type safety
    switch (status) {
      case OrderStatus.PENDING:
        return "secondary"; // Use secondary for yellow-ish/grey
      case OrderStatus.PROCESSING:
        return "default"; // Use default (primary theme color) for blue-ish
      case OrderStatus.SHIPPED:
        return "secondary"; // Use secondary for indigo-ish/grey
      case OrderStatus.DELIVERED:
        return "default"; // Consider 'success' variant if you added it, otherwise 'default' or 'secondary'
      case OrderStatus.CANCELLED:
        return "destructive"; // Use destructive for red
      case OrderStatus.REFUNDED:
        return "outline"; // Use outline for orange-ish/neutral
      default:
        return "outline"; // Fallback to outline
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };
  const getProductName = (item: any) => {
    if (item?.variation?.product?.productName)
      return item.variation.product.productName;
    if (item?.variation?.productName) return item.variation.productName;
    if (item?.variation?.product?.name) return item.variation.product.name;
    if (item?.variation?.name) return item.variation.name;
    return "Unnamed Product";
  };
  const handleViewDetails = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Filtering logic
  const filteredOrders = useMemo(
    () =>
      orders?.filter((order) => {
        const searchLower = searchQuery.toLowerCase();
        const searchMatch =
          !searchQuery ||
          order.id.toLowerCase().includes(searchLower) ||
          order.referenceNumber?.toLowerCase().includes(searchLower) ||
          `${order.firstName} ${order.lastName}`
            .toLowerCase()
            .includes(searchLower) ||
          order.companyName?.toLowerCase().includes(searchLower) ||
          order.email.toLowerCase().includes(searchLower) ||
          order.orderItems.some((item) =>
            getProductName(item).toLowerCase().includes(searchLower),
          );

        const statusMatch =
          statusFilter === "ALL" || order.status === statusFilter;
        // Ensure date comparison handles potential timezone issues if necessary
        const dateMatch =
          !startDate ||
          new Date(order.createdAt).toLocaleDateString() ===
            new Date(startDate + "T00:00:00").toLocaleDateString();

        return searchMatch && statusMatch && dateMatch;
      }) ?? [],
    [orders, searchQuery, statusFilter, startDate],
  ); // Added dependencies

  if (!orders || orders.length === 0) {
    return (
      <Card className="text-center py-10">
        <CardHeader>
          <CardTitle className="text-lg">No orders found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters using shadcn components */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="order-search"
              type="search"
              placeholder="Search orders by ID, name, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-background" // Use theme background
            />
          </div>
          <div className="w-full md:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrderStatus | "ALL")
              }
            >
              <SelectTrigger className="w-full md:w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full md:w-auto">
            <CalendarIcon className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="date-filter"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Filter by date"
              className="bg-background pr-8"
            />
          </div>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card className="text-center py-10">
          <CardHeader>
            <CardTitle className="text-lg">No orders match filters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {" "}
          {/* Card provides background and border */}
          {/* Use shadcn Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Order ID</TableHead>{" "}
                {/* Adjusted width */}
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistance(new Date(order.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="max-w-[200px] text-xs">
                    {" "}
                    {/* Limit width */}
                    <div className="truncate space-y-0.5">
                      {" "}
                      {/* Truncate and less spacing */}
                      {order.orderItems.map((item, index) => (
                        <div key={item.id}>
                          <span className="font-medium">{item.quantity}×</span>{" "}
                          {getProductName(item)}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" /> View{" "}
                      {/* Added Icon */}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default OrderTable;

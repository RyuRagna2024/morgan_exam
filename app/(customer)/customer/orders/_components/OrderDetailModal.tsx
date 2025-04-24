// app/(customer)/orders/_components/OrderDetailModal.tsx
"use client";
import React from "react";
import { formatDistance, format } from "date-fns";
// Import the CORRECT types from where they are defined
import { OrderWithItems, OrderItemWithDetails } from "../types"; // Adjust path if needed
import { OrderStatus } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderDetailModalProps {
  order: OrderWithItems | null; // Use the precise type
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  // --- Helper functions ---
  const formatCurrency = (amount: number) => {
    /* ... */ return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };
  const getStatusVariant = (status: OrderStatus): BadgeProps["variant"] => {
    /* ... */
    switch (status) {
      case OrderStatus.PENDING:
        return "secondary";
      case OrderStatus.PROCESSING:
        return "default";
      case OrderStatus.SHIPPED:
        return "secondary";
      case OrderStatus.DELIVERED:
        return "default";
      case OrderStatus.CANCELLED:
        return "destructive";
      case OrderStatus.REFUNDED:
        return "outline";
      default:
        return "outline";
    }
  };

  // Helper function using the precise OrderItemWithDetails type
  const getProductName = (item: OrderItemWithDetails): string => {
    // Access properties safely - these should now exist on the type
    return (
      item.variation?.product?.productName || // Use correct field from Product
      item.variation?.name || // Fallback to Variation name
      "Product details unavailable"
    );
  };

  // Helper function using the precise OrderItemWithDetails type
  const getProductImageUrl = (item: OrderItemWithDetails): string => {
    // Access properties safely - these should now exist on the type
    return (
      item.variation?.imageUrl || // Use Variation image field first
      item.variation?.product?.productImgUrl || // Fallback to Product image field
      "/placeholder.jpg"
    ); // Final fallback
  };
  // --- End Helper functions ---

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 bg-card text-card-foreground border-border">
        {/* DialogHeader */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          {/* ... header content ... */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
              <DialogTitle className="text-2xl font-semibold">
                Order Details
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {" "}
                ID:{" "}
                <span className="font-medium text-foreground">
                  {order.id}
                </span>{" "}
              </p>
              <p className="text-sm text-muted-foreground">
                {" "}
                Ref:{" "}
                <span className="font-medium text-foreground">
                  {order.referenceNumber || "N/A"}
                </span>{" "}
              </p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0 mt-2 sm:mt-0">
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {" "}
                {format(new Date(order.createdAt), "PPp")}{" "}
              </p>
              <p className="text-xs text-muted-foreground">
                {" "}
                (
                {formatDistance(new Date(order.createdAt), new Date(), {
                  addSuffix: true,
                })}
                ){" "}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 text-sm">
            {/* Content Grid (Customer, Shipping, Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border pb-6">
              {/* ... Customer/Shipping/Summary sections ... */}
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  Customer
                </h3>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Name:
                  </span>{" "}
                  {order.firstName} {order.lastName}
                </p>
                {order.companyName && (
                  <p>
                    <span className="text-muted-foreground w-[80px] inline-block">
                      Company:
                    </span>{" "}
                    {order.companyName}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Email:
                  </span>{" "}
                  {order.email}
                </p>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Phone:
                  </span>{" "}
                  {order.phone}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  Shipping / Collection
                </h3>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Method:
                  </span>{" "}
                  {order.methodOfCollection}
                </p>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Branch:
                  </span>{" "}
                  {order.captivityBranch}
                </p>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Address:
                  </span>{" "}
                  {order.streetAddress}
                  {order.apartmentSuite && `, ${order.apartmentSuite}`}
                </p>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    City:
                  </span>{" "}
                  {order.townCity}, {order.province} {order.postcode}
                </p>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Country:
                  </span>{" "}
                  {order.countryRegion}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  Summary
                </h3>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Items:
                  </span>{" "}
                  {order.orderItems.length}
                </p>
                <p>
                  <span className="text-muted-foreground w-[80px] inline-block">
                    Total:
                  </span>{" "}
                  <span className="font-semibold text-lg text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </p>
                {order.salesRep && (
                  <p>
                    <span className="text-muted-foreground w-[80px] inline-block">
                      Sales Rep:
                    </span>{" "}
                    {order.salesRep}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mt-0">
              <h3 className="font-semibold text-foreground mb-4 text-base">
                Items Ordered
              </h3>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] h-10 px-2">
                        Image
                      </TableHead>
                      <TableHead className="px-2">Product</TableHead>
                      <TableHead className="text-center px-2">Qty</TableHead>
                      <TableHead className="text-right px-2">Price</TableHead>
                      <TableHead className="text-right px-2">
                        Subtotal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Map over items using the precise type */}
                    {order.orderItems.map((item: OrderItemWithDetails) => (
                      <TableRow key={item.id}>
                        <TableCell className="p-2">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-border relative bg-muted">
                            <Image
                              src={getProductImageUrl(item)} // Now uses correct fields
                              alt={getProductName(item)} // Now uses correct fields
                              fill
                              sizes="40px"
                              className="object-cover object-center"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.jpg";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium whitespace-normal px-2 py-3">
                          {getProductName(item)}
                        </TableCell>
                        <TableCell className="text-center px-2 py-3">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right px-2 py-3">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right font-medium px-2 py-3">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-muted/50 hover:bg-muted/60 dark:bg-muted/30 dark:hover:bg-muted/40">
                      <TableCell
                        colSpan={4}
                        className="text-right font-bold text-base px-2 py-3"
                      >
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold text-base px-2 py-3">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>

            {/* Additional Notes */}
            {/* Conditionally render this block if order.orderNotes exists */}
            {order.orderNotes && (
              // --- REPLACE COMMENT WITH ACTUAL JSX ---
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  Order Notes
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded border border-border">
                  {order.orderNotes} {/* Display the actual notes */}
                </p>
              </div>
              // --- END REPLACEMENT ---
            )}
          </div>{" "}
          {/* Closing tag for the p-6 space-y-6 div */}
        </ScrollArea>

        {/* DialogFooter */}
        <DialogFooter className="p-4 pt-4 border-t border-border bg-muted/30">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;

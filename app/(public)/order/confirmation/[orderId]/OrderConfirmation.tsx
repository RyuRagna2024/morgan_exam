// app/(public)/orders/confirmation/[orderId]/OrderConfirmation.tsx
"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Loader2, ShoppingBag } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link"; // Ensure Link is imported from 'next/link'
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { Badge } from "@/components/ui/badge"; // Adjust path if needed

// Import the action and the correct response type
// Adjust these paths if your files are located differently
import { getOrderDetails } from "@/app/(public)/checkout/checkout-actions";
import type {
  GetOrderDetailsResponse,
  OrderWithRelations,
} from "@/app/(public)/checkout/order-types";

// Helper function to format dates (accepts Date object or string)
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date passed to formatDate:", date);
      return "Invalid Date";
    }
    // Example Locale: South Africa. Adjust 'en-ZA' and options as needed.
    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "long", // e.g., "30 April 2025"
      timeStyle: "short", // e.g., "18:34"
      hour12: false,
    }).format(dateObj);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Error Formatting Date";
  }
};

// Helper function to map status to badge variant (using existing variants)
const getStatusVariant = (
  status: string | undefined,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
    case "SHIPPED":
    case "DELIVERED":
      return "default"; // Use default (often primary color) for success
    case "PROCESSING":
      return "default"; // Use default for processing
    case "PENDING":
      return "secondary"; // Use secondary (often gray) for pending
    case "CANCELLED":
    case "FAILED":
    case "REFUNDED":
      return "destructive"; // Use destructive (often red)
    default:
      return "secondary"; // Fallback
  }
};

interface OrderConfirmationProps {
  orderId: string;
}

const OrderConfirmation = ({ orderId }: OrderConfirmationProps) => {
  const [orderData, setOrderData] = useState<OrderWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrderDetails = async () => {
      if (!isMounted || !orderId) {
        if (isMounted && !orderId) setError("Order ID missing.");
        if (isMounted) setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setOrderData(null);
      console.log(`OrderConfirmation: Fetching order ${orderId}...`);

      try {
        const result: GetOrderDetailsResponse = await getOrderDetails(orderId);
        if (!isMounted) return;

        if (result.success && result.order) {
          console.log(`OrderConfirmation: Success fetching order ${orderId}`);
          setOrderData(result.order);
        } else {
          console.error(
            `OrderConfirmation: Failed fetch for ${orderId}:`,
            result.message,
          );
          setError(result.message || "Failed to load order details.");
        }
      } catch (err) {
        console.error(
          `OrderConfirmation: Critical error fetching ${orderId}:`,
          err,
        );
        if (isMounted)
          setError("An unexpected error occurred while fetching details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrderDetails();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] flex-col">
        <Loader2
          className="h-12 w-12 animate-spin text-primary mb-4"
          aria-label="Loading order details"
        />
        <p className="text-muted-foreground">Loading Order Details...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error || !orderData) {
    return (
      <div className="text-center py-12 px-4 max-w-2xl mx-auto bg-card border border-border rounded-lg shadow">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-3">
          {error === "Order not found."
            ? "Order Not Found"
            : "Error Loading Order"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {error ||
            "Could not display the order details. Please check the Order ID or try again later."}
        </p>
        <Link href="/customer/orders">
          {" "}
          {/* Corrected link for error state too */}
          <Button variant="secondary">View Your Orders</Button>
        </Link>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  return (
    <div className="w-full max-w-4xl mx-auto mt-10 mb-10">
      {/* Confirmation Header */}
      <div className="text-center mb-10">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Thank you, {orderData.firstName}. Your order is being processed.
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Order details are below. A confirmation email{" "}
          {orderData.email
            ? `has been sent to ${orderData.email}`
            : "will be sent"}
          .
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
        {/* Card Header */}
        <div className="bg-muted/50 px-6 py-4 border-b border-border">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">
              Order Ref:{" "}
              <span className="font-mono text-primary">
                {orderData.id.slice(-8).toUpperCase()}
              </span>
            </h2>
            <Badge
              variant={getStatusVariant(orderData.status)}
              className="capitalize text-xs px-2.5 py-0.5"
            >
              {orderData.status.toLowerCase().replace("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Placed on: {formatDate(orderData.createdAt)}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Address & Contact Grid */}
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div>
              <h3 className="text-base font-semibold text-card-foreground mb-2 border-b border-border pb-1">
                Billing & Shipping Address
              </h3>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-card-foreground">
                  {orderData.firstName} {orderData.lastName}
                </p>
                {orderData.companyName && <p>{orderData.companyName}</p>}
                <p>{orderData.streetAddress}</p>
                {orderData.apartmentSuite && <p>{orderData.apartmentSuite}</p>}
                <p>
                  {orderData.townCity}, {orderData.province},{" "}
                  {orderData.postcode}
                </p>
                <p>{orderData.countryRegion}</p>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-card-foreground mb-2 border-b border-border pb-1">
                Contact & Order Info
              </h3>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p>
                  <span className="font-medium text-card-foreground">
                    Email:
                  </span>{" "}
                  {orderData.email}
                </p>
                <p>
                  <span className="font-medium text-card-foreground">
                    Phone:
                  </span>{" "}
                  {orderData.phone}
                </p>
                <p>
                  <span className="font-medium text-card-foreground">
                    Branch:
                  </span>{" "}
                  {orderData.captivityBranch}
                </p>
                <p>
                  <span className="font-medium text-card-foreground">
                    Method:
                  </span>{" "}
                  {orderData.methodOfCollection}
                </p>
                {orderData.salesRep && (
                  <p>
                    <span className="font-medium text-card-foreground">
                      Sales Rep:
                    </span>{" "}
                    {orderData.salesRep}
                  </p>
                )}
                {orderData.referenceNumber && (
                  <p>
                    <span className="font-medium text-card-foreground">
                      Ref:
                    </span>{" "}
                    {orderData.referenceNumber}
                  </p>
                )}
                {orderData.paymentIntentId && (
                  <p className="text-xs mt-1 opacity-75">
                    <span className="font-medium">Payment ID:</span> pi_...
                    {orderData.paymentIntentId.slice(-6)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {orderData.orderNotes && (
            <div className="mb-8">
              <h3 className="text-base font-semibold text-card-foreground mb-2">
                Order Notes
              </h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded border border-border whitespace-pre-wrap">
                {orderData.orderNotes}
              </p>
            </div>
          )}

          {/* Order Items List */}
          <div className="border-t border-border pt-6">
            <h3 className="text-base font-semibold text-card-foreground mb-4">
              Items Ordered ({orderData.orderItems?.length || 0})
            </h3>
            <div className="space-y-4">
              {orderData.orderItems?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-muted rounded border border-border relative overflow-hidden">
                    <NextImage
                      src={
                        item.variation?.imageUrl ||
                        item.variation?.product?.productImgUrl ||
                        "/images/placeholder.png"
                      } // Ensure placeholder exists
                      alt={
                        item.variation?.product?.productName || "Product Image"
                      }
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.png";
                        e.currentTarget.srcset = "";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-card-foreground truncate">
                      {item.variation?.product?.productName ||
                        "Unknown Product"}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.variation?.name ||
                        `${item.variation?.size || ""} ${item.variation?.color || ""}`.trim() ||
                        "Standard"}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x{" "}
                        <span className="text-card-foreground font-medium">
                          R{item.price.toFixed(2)}
                        </span>
                      </p>
                      <p className="text-sm font-semibold text-card-foreground">
                        R{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t border-border pt-6 mt-6 text-right">
            <div className="flex justify-end items-baseline space-x-2">
              <p className="text-lg font-semibold text-card-foreground">
                Order Total:
              </p>
              <p className="text-xl font-bold text-primary">
                R{orderData.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <<< Action Buttons with Corrected Links >>> */}
      <div className="mt-8 flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-center gap-4">
        {/* View All My Orders Button */}
        <Link href="/customer/orders">
          <Button variant="outline" className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" /> View All My Orders
          </Button>
        </Link>
        {/* Continue Shopping Button */}
        <Link href="/">
          <Button className="w-full sm:w-auto">Continue Shopping</Button>
        </Link>
      </div>
      {/* <<< End Action Buttons >>> */}
    </div>
  );
};

export default OrderConfirmation;

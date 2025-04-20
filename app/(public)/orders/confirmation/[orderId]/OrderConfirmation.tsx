"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react"; // Added AlertTriangle for error
import NextImage from "next/image";
import { getOrderDetails } from "@/app/(public)/checkout/checkout-order"; // Correct path?
import { GetOrderDetailsResponse } from "@/app/(public)/checkout/order-types"; // Correct path?
import Link from "next/link"; // Import Link for error state button
import { Button } from "@/components/ui/button"; // Import Button for error state

// Define the OrderItem type (ensure fields match include in getOrderDetails)
interface OrderItem {
  id: string;
  quantity: number;
  price: number; // This should be the discounted price per item stored
  variation: {
    id: string;
    name?: string; // Optional, depends on schema/include
    color?: string; // Optional
    size?: string; // Optional
    imageUrl?: string; // Optional but likely present
    product: {
      id: string;
      productName: string;
      productImgUrl?: string; // Optional but likely present
    };
  };
}

// --- UPDATED Order interface ---
// Define the Order type based on orderValidationSchema and Prisma model fields
interface Order {
  id: string;
  status: string;
  createdAt: string; // Keep as string from DB or convert to Date
  totalAmount: number; // The final discounted total
  // Fields from your orderValidationSchema / Prisma Model
  firstName: string;
  lastName: string;
  companyName?: string; // Optional based on schema
  streetAddress: string;
  apartmentSuite?: string; // Optional based on schema
  townCity: string;
  province: string;
  postcode: string;
  countryRegion: string; // Matches schema name
  email: string;
  phone: string;
  orderNotes?: string; // Optional based on schema
  captivityBranch: string; // Matches schema
  methodOfCollection: string; // Matches schema
  salesRep?: string; // Optional
  referenceNumber?: string; // Optional
  // Included relation
  orderItems: OrderItem[];
}

interface OrderConfirmationProps {
  orderId: string;
}

const OrderConfirmation = ({ orderId }: OrderConfirmationProps) => {
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      console.log(
        `[OrderConfirmation] useEffect triggered for orderId: ${orderId}`,
      );
      if (!orderId) {
        console.warn("[OrderConfirmation] orderId is missing.");
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true); // Ensure loading state is true at the start
      setError(null); // Reset error state

      try {
        console.log(
          `[OrderConfirmation] Calling getOrderDetails for ${orderId}...`,
        );
        // Casting here assumes getOrderDetails always returns this type on success
        const result = await getOrderDetails(orderId);
        console.log(
          `[OrderConfirmation] getOrderDetails response for ${orderId}:`,
          result,
        );

        if (result.success && result.order) {
          // IMPORTANT: Validate the structure of result.order here if needed
          // before casting and setting state.
          console.log(
            `[OrderConfirmation] Successfully fetched order data for ${orderId}.`,
          );
          setOrderData(result.order as Order); // Cast result.order to your Order type
        } else {
          console.error(
            `[OrderConfirmation] Failed to fetch order ${orderId}:`,
            result.message,
          );
          setError(
            result.message ||
              "Failed to load order details. The order might not exist or an error occurred.",
          );
        }
      } catch (err) {
        console.error(
          `[OrderConfirmation] Critical error fetching order ${orderId}:`,
          err,
        );
        setError(
          "An unexpected error occurred while fetching your order details.",
        );
      } finally {
        console.log(
          `[OrderConfirmation] Finished fetching attempt for ${orderId}. Setting loading to false.`,
        );
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]); // Dependency array includes orderId

  // Loading State
  if (loading) {
    console.log("[OrderConfirmation] Rendering Loading State.");
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div
          className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
          aria-label="Loading order details"
        ></div>
        <p className="ml-4 text-gray-600">Loading Order Details...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    console.log("[OrderConfirmation] Rendering Error State:", error);
    return (
      <div className="text-center py-12 px-4 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg shadow">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-3">
          Error Loading Order
        </h2>
        <p className="text-red-600 mb-6">{error}</p>
        <Link href="/orders">
          <Button variant="destructive">View Your Orders</Button>
        </Link>
      </div>
    );
  }

  // No Order Data State (after loading and no error, but still null)
  if (!orderData) {
    console.log(
      "[OrderConfirmation] Rendering No Order Data State (after load).",
    );
    return (
      <div className="text-center py-12 px-4 max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg shadow">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-yellow-700 mb-3">
          Order Not Found
        </h2>
        <p className="text-yellow-600 mb-6">
          Could not display the order details. It might still be processing or
          does not exist.
        </p>
        <Link href="/orders">
          <Button variant="outline">View Your Orders</Button>
        </Link>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  console.log(
    "[OrderConfirmation] Rendering Success State with orderData:",
    orderData,
  );

  // Format date (consider moving to a utils file)
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-ZA", {
        // Example: South Africa locale
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Use 24-hour format or true for AM/PM
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Fallback to original string
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 mb-10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        {/* Optional: Animate check mark */}
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-800">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          A proforma invoice will be sent to your email address.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {/* Order Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {/* Use a safer way to get order number if ID is long */}
              Order Ref:{" "}
              <span className="font-mono text-blue-700">
                {orderData.id.slice(-8)}
              </span>
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                orderData.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : orderData.status === "PROCESSING"
                    ? "bg-blue-100 text-blue-800"
                    : orderData.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : orderData.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800" // Default/other statuses
              }`}
            >
              Status: {orderData.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Placed on: {formatDate(orderData.createdAt)}
          </p>
        </div>

        {/* Order Body */}
        <div className="p-6">
          {/* Addresses & Contact */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Use updated fields from Order interface */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-1">
                Billing & Shipping Details
              </h3>
              <div className="text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {orderData.firstName} {orderData.lastName}
                </p>
                {orderData.companyName && (
                  <p>
                    <span className="font-medium">Company:</span>{" "}
                    {orderData.companyName}
                  </p>
                )}
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {orderData.streetAddress}
                </p>
                {orderData.apartmentSuite && <p>{orderData.apartmentSuite}</p>}
                <p>
                  {orderData.townCity}, {orderData.province},{" "}
                  {orderData.postcode}
                </p>
                <p>{orderData.countryRegion}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-1">
                Contact & Order Info
              </h3>
              <div className="text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Email:</span> {orderData.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {orderData.phone}
                </p>
                <p>
                  <span className="font-medium">Branch:</span>{" "}
                  {orderData.captivityBranch}
                </p>
                <p>
                  <span className="font-medium">Collection:</span>{" "}
                  {orderData.methodOfCollection}
                </p>
                {orderData.salesRep && (
                  <p>
                    <span className="font-medium">Sales Rep:</span>{" "}
                    {orderData.salesRep}
                  </p>
                )}
                {orderData.referenceNumber && (
                  <p>
                    <span className="font-medium">Reference:</span>{" "}
                    {orderData.referenceNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {orderData.orderNotes && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-1">
                Order Notes
              </h3>
              {/* Display only user notes, hide system notes */}
              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {orderData.orderNotes.split("\n\n--- System Notes ---")[0] ||
                  "No additional notes provided."}
              </p>
            </div>
          )}

          {/* Order Items List */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Order Items
            </h3>
            <div className="space-y-5">
              {orderData.orderItems?.map((item) => (
                <div
                  key={item.id} // Use item.id (OrderItem ID) if unique, otherwise item.variation.id might work
                  className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  {/* Image */}
                  <div className="flex-shrink-0 h-20 w-20 bg-gray-100 rounded-md border border-gray-200 relative overflow-hidden">
                    <NextImage
                      src={
                        item.variation.imageUrl || // Prefer variation image
                        item.variation.product.productImgUrl || // Fallback to product image
                        "/images/placeholder.png" // Provide a real placeholder path
                      }
                      alt={item.variation.product.productName}
                      fill
                      sizes="(max-width: 768px) 80px, 80px" // Specify sizes
                      className="object-contain p-1" // Use contain if images vary in aspect ratio
                      onError={(e) => {
                        // Handle image loading errors
                        e.currentTarget.src = "/images/placeholder.png"; // Fallback on error
                        e.currentTarget.srcset = "";
                      }}
                    />
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-800 font-medium truncate">
                      {item.variation.product.productName}
                    </h4>
                    {/* Variation Details */}
                    <p className="text-gray-500 text-sm truncate">
                      {/* Display variation name or attributes */}
                      {item.variation.name ||
                        `${item.variation.size || ""}${item.variation.size && item.variation.color ? " / " : ""}${item.variation.color || ""}` ||
                        "Standard"}
                    </p>
                    {/* Price & Qty */}
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-600 text-sm">
                        {item.quantity} x{" "}
                        <span className="text-gray-800">
                          R{item.price.toFixed(2)}
                        </span>
                      </p>
                      <p className="text-gray-900 font-medium">
                        {/* Use R currency symbol */}R
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            {/* Could add subtotal/discount breakdown here if needed by parsing orderNotes */}
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <p>Order Total:</p>
              {/* Use R currency symbol */}
              <p>R{orderData.totalAmount.toFixed(2)}</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Payment due upon receipt of Proforma Invoice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

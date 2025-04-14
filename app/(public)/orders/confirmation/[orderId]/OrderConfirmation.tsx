"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import NextImage from "next/image";
import { getOrderDetails } from "@/app/(public)/checkout/checkout-order";
import { GetOrderDetailsResponse } from "@/app/(public)/checkout/order-types";

// Define the OrderItem type
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variation: {
    id: string;
    name?: string;
    color?: string;
    size?: string;
    imageUrl?: string;
    product: {
      id: string;
      productName: string;
      productImgUrl?: string;
    };
  };
}

// Define the Order type
interface Order {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
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
      if (!orderId) return;

      try {
        const result = (await getOrderDetails(
          orderId,
        )) as GetOrderDetailsResponse;
        if (result.success && result.order) {
          setOrderData(result.order as Order);
        } else {
          setError(result.message || "Failed to load order details");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-block animate-bounce mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Thank you for your purchase. Your order has been received.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Order #{orderId.slice(-6)}
            </h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {orderData?.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Placed on{" "}
            {orderData?.createdAt ? formatDate(orderData.createdAt) : "N/A"}
          </p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-gray-700 font-medium mb-2">
                Shipping Address
              </h3>
              <div className="text-gray-600">
                <p>{orderData?.fullName}</p>
                <p>{orderData?.address}</p>
                <p>
                  {orderData?.city}, {orderData?.postalCode}
                </p>
                <p>{orderData?.country}</p>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-medium mb-2">
                Contact Information
              </h3>
              <div className="text-gray-600">
                <p>Email: {orderData?.email}</p>
                <p>Phone: {orderData?.phone}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-gray-700 font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderData?.orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start border-b border-gray-100 pb-4"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                    <NextImage
                      src={
                        item.variation.imageUrl ||
                        item.variation.product.productImgUrl ||
                        "/placeholder.jpg"
                      }
                      alt={item.variation.product.productName}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-gray-800 font-medium">
                      {item.variation.product.productName}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {item.variation.size && `Size: ${item.variation.size}`}
                      {item.variation.color && item.variation.size && " | "}
                      {item.variation.color && `Color: ${item.variation.color}`}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-gray-500 text-sm">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-gray-800 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${orderData?.totalAmount.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

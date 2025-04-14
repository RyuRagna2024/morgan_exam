"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import OrderSummary from "./OrderSummary";

// Custom hooks
import { useCart } from "../productId/cart/_store/use-cart-store-hooks";
import { useCartStore } from "../productId/cart/_store/cart-store";

// Types and validations
import { OrderInput } from "./order-types";
import { orderValidationSchema } from "./order-validations";

// Server actions
import { placeOrder } from "./checkout-order";
import CheckoutForm from "./CheckoutForm";

export default function Checkout() {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<OrderInput>({
    resolver: zodResolver(orderValidationSchema),
    defaultValues: {
      captivityBranch: "",
      methodOfCollection: "",
      salesRep: "",
      referenceNumber: "",
      firstName: "",
      lastName: "",
      companyName: "",
      countryRegion: "South Africa",
      streetAddress: "",
      apartmentSuite: "",
      townCity: "",
      province: "",
      postcode: "",
      phone: "",
      email: "",
      orderNotes: "",
      agreeTerms: false,
      receiveEmailReviews: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: OrderInput) => {
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before checkout.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await placeOrder(data);

      if (result.success) {
        toast.success("Order placed successfully!");

        // IMPORTANT: Explicitly update the cart state to reflect the empty cart
        // This ensures that both the cart badge and sidebar are updated immediately
        const cartStore = useCartStore.getState();

        // First update the state directly for immediate UI feedback
        cartStore.setItems([]);
        cartStore.setItemCount(0);
        cartStore.setLastUpdated(Date.now());

        // Then do a background refresh to ensure everything is in sync
        setTimeout(() => {
          cartStore.refreshCart(false);
        }, 300);

        // Redirect to order confirmation page
        if (result.orderId) {
          router.push(`/orders/confirmation/${result.orderId}`);
        } else {
          router.push("/orders");
        }
      } else {
        // Handle validation errors
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(field as any, {
              type: "manual",
              message,
            });
          });
          toast.error("Please check the form for errors");
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">CHECKOUT PAGE</h1>
        <Link href="/cart" className="flex items-center">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form Section */}
        <CheckoutForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          hasItems={items.length > 0}
        />

        {/* Order Summary Section */}
        <OrderSummary items={items} totalPrice={totalPrice} />
      </div>
    </div>
  );
}

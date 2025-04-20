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

// Custom hooks - Ensure these paths are correct
// Assuming they are in a structure like app/(public)/productId/cart/_store/
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
  const { items, totalPrice } = useCart(); // Assuming useCart provides live cart data
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<OrderInput>({
    resolver: zodResolver(orderValidationSchema),
    // Consider pre-filling user details if available (e.g., from user profile)
    defaultValues: {
      captivityBranch: "",
      methodOfCollection: "",
      salesRep: "",
      referenceNumber: "",
      firstName: "", // Pre-fill if possible
      lastName: "", // Pre-fill if possible
      companyName: "", // Pre-fill if possible
      countryRegion: "South Africa", // Default or user's country
      streetAddress: "", // Pre-fill if possible
      apartmentSuite: "", // Pre-fill if possible
      townCity: "", // Pre-fill if possible
      province: "", // Pre-fill if possible
      postcode: "", // Pre-fill if possible
      phone: "", // Pre-fill if possible
      email: "", // Pre-fill if possible
      orderNotes: "",
      agreeTerms: false,
      receiveEmailReviews: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: OrderInput) => {
    console.log("[CheckoutPage onSubmit] Form submitted."); // Log submission start

    // Re-check cart items just before submission
    const currentCartItems = useCartStore.getState().items; // Get latest from store
    if (currentCartItems.length === 0) {
      console.warn("[CheckoutPage onSubmit] Cart is empty check failed.");
      toast.error("Your cart is empty. Please add items before checkout.");
      // Optionally refresh cart state here if needed
      // useCartStore.getState().refreshCart();
      return;
    }

    setIsSubmitting(true);
    console.log("[CheckoutPage onSubmit] Submitting order data:", data); // Log data being sent

    try {
      const result = await placeOrder(data);
      console.log(
        "[CheckoutPage onSubmit] placeOrder response received:",
        result,
      ); // *** Log the raw response ***

      if (result.success) {
        console.log(
          "[CheckoutPage onSubmit] Order success! Order ID:",
          result.orderId,
        ); // Log success and ID
        toast.success("Order placed successfully!");

        // IMPORTANT: Explicitly update the cart state
        console.log("[CheckoutPage onSubmit] Clearing local cart state...");
        const cartStore = useCartStore.getState();
        cartStore.setItems([]);
        cartStore.setItemCount(0);
        cartStore.setLastUpdated(Date.now());
        console.log("[CheckoutPage onSubmit] Local cart state cleared.");

        // Trigger background refresh (optional but good practice)
        setTimeout(() => {
          console.log(
            "[CheckoutPage onSubmit] Triggering background cart refresh.",
          );
          cartStore.refreshCart(false); // false = don't force show loading
        }, 300);

        // Redirect to order confirmation page
        if (result.orderId) {
          const confirmationPath = `/orders/confirmation/${result.orderId}`;
          console.log(
            "[CheckoutPage onSubmit] Redirecting to confirmation page:",
            confirmationPath,
          );
          router.push(confirmationPath);
        } else {
          // THIS IS A PROBLEM STATE - success true but no orderId
          console.warn(
            "[CheckoutPage onSubmit] Order successful but NO orderId returned by server action. Redirecting to /orders.",
          );
          // --- *** Corrected Method Name *** ---
          toast.warning(
            "Order placed, but confirmation details might be delayed. Redirecting to your orders.",
          ); // Use toast.warning
          // --- *** End of Correction *** ---
          router.push("/orders"); // Fallback redirect
        }
      } else {
        // Handle failure reported by the server action
        console.error(
          "[CheckoutPage onSubmit] Order placement failed. Reason:",
          result.message,
          "Errors:",
          result.errors,
        ); // Log failure details
        if (result.errors) {
          // Handle validation errors
          console.log(
            "[CheckoutPage onSubmit] Setting form errors from server.",
          );
          Object.entries(result.errors).forEach(([field, message]) => {
            // Need to handle potential nested fields if schema changes
            form.setError(field as keyof OrderInput, {
              // Cast to keyof OrderInput for type safety
              type: "server", // Use a custom type like 'server'
              message,
            });
          });
          toast.error("Please check the highlighted form fields for errors.");
        } else {
          // Handle other errors (stock, generic failure)
          toast.error(
            `Order failed: ${result.message || "An unknown error occurred."}`,
          );
        }
      }
    } catch (error) {
      // Catch unexpected client-side errors during the submission process
      console.error(
        "[CheckoutPage onSubmit] Critical client-side error during submission:",
        error,
      );
      toast.error(
        "A critical error occurred while submitting your order. Please try again.",
      );
    } finally {
      console.log("[CheckoutPage onSubmit] Setting isSubmitting to false.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">CHECKOUT PAGE</h1>
        <Link href="/cart" className="flex items-center">
          <Button variant="outline" size="icon" aria-label="Back to Cart">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form Section */}
        <CheckoutForm
          form={form}
          onSubmit={onSubmit} // Pass the handler here
          isSubmitting={isSubmitting}
          // Pass live item count to disable button correctly
          hasItems={items.length > 0}
        />

        {/* Order Summary Section */}
        {/* Ensure OrderSummary uses the same data source (useCart hook) or receives updated props */}
        <OrderSummary items={items} totalPrice={totalPrice} />
      </div>
    </div>
  );
}

// app/(public)/checkout/CheckoutPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import OrderSummary from "./OrderSummary";
import CheckoutForm from "./CheckoutForm"; // Contains Stripe Elements

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
// --- Import StripeElementsOptions and Appearance types ---
import type { StripeElementsOptions, Appearance } from "@stripe/stripe-js"; // Use Appearance

// Custom hooks
import { useCart } from "../productId/cart/_store/use-cart-store-hooks"; // Ensure this path is correct
import { useTheme } from "next-themes";

// Server Action
import { createPaymentIntentAction } from "./checkout-order"; // Ensure this path is correct

// Load Stripe outside component
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error(
    "Stripe Publishable Key is missing. Payment functionality will be disabled.",
  );
  // You might want to display a more user-friendly message in the UI
}

export default function Checkout() {
  const router = useRouter();
  const { items, totalPrice, isLoading: isCartLoading } = useCart();
  const { theme } = useTheme();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // Track PI fetching
  const [elementsOptions, setElementsOptions] = useState<
    StripeElementsOptions | undefined
  >(undefined);

  // Fetch PaymentIntent Client Secret
  useEffect(() => {
    // Don't fetch if stripe isn't loaded or cart is empty
    if (!stripePromise || items.length === 0) {
      setIsInitializing(false);
      setClientSecret(null);
      return;
    }

    // Only proceed if cart is not loading and has items
    if (!isCartLoading && items.length > 0) {
      setIsInitializing(true);
      setLoadingError(null);
      console.log("Attempting to create PaymentIntent...");

      createPaymentIntentAction()
        .then((result) => {
          if (result.success && result.clientSecret) {
            console.log("PaymentIntent created, clientSecret received.");
            setClientSecret(result.clientSecret);
          } else {
            console.error("Failed to create PaymentIntent:", result.error);
            setLoadingError(result.error || "Failed to initialize payment.");
            toast.error(result.error || "Failed to initialize payment.");
            setClientSecret(null);
          }
        })
        .catch((error) => {
          console.error("Error calling createPaymentIntentAction:", error);
          setLoadingError(
            "An unexpected error occurred during initialization.",
          );
          toast.error("An unexpected error occurred during initialization.");
          setClientSecret(null);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else if (!isCartLoading && items.length === 0) {
      // Handle case where cart loads but is empty
      setIsInitializing(false);
      setClientSecret(null);
    }

    // Rerun when item count changes OR when cart loading finishes
  }, [items.length, isCartLoading]);

  // Define options dynamically based on theme
  useEffect(() => {
    if (clientSecret) {
      // Define appearance object using the 'Appearance' type
      const appearance: Appearance = {
        theme: "stripe", // Base theme: 'stripe', 'night', 'flat', or none
        variables: {
          // Base variables for light mode or general theme
          colorPrimary: "#0ea5e9", // Example: sky-500
          colorBackground: "#ffffff",
          colorText: "#1f2937", // Example: gray-800
          colorDanger: "#dc2626", // Example: red-600
          fontFamily: "inherit", // Use the font from your layout
          spacingUnit: "4px",
          borderRadius: "4px",
          // Add more variables as needed
        },
        rules: {
          // Optional: Fine-tune specific elements
          ".Input": {
            borderColor: "#d1d5db", // Example: gray-300
          },
          ".Label": {
            color: "#4b5563", // Example: gray-600
            fontWeight: "500",
          },
        },
      };

      // Apply dark mode overrides
      if (theme === "dark") {
        appearance.variables = {
          ...appearance.variables, // Keep base variables unless overridden
          colorPrimary: "#38bdf8", // Example: sky-400
          colorBackground: "#1f2937", // Example: gray-800
          colorText: "#f9fafb", // Example: gray-50
          colorTextSecondary: "#9ca3af", // Example: gray-400
          colorTextPlaceholder: "#6b7280", // Example: gray-500
          colorDanger: "#f87171", // Example: red-400
          // Add other dark mode variables
        };
        appearance.rules = {
          ...appearance.rules, // Keep base rules
          ".Input": {
            ...appearance.rules?.[".Input"], // Keep base input rules
            backgroundColor: "#374151", // Example: gray-700
            borderColor: "#4b5563", // Example: gray-600
            color: "#f9fafb",
          },
          ".Label": {
            ...appearance.rules?.[".Label"], // Keep base label rules
            color: "#d1d5db", // Example: gray-300
          },
          // Example: Style the payment tabs in dark mode
          ".Tab": {
            backgroundColor: "#374151", // gray-700
            boxShadow: "none",
            borderColor: "#4b5563", // gray-600
          },
          ".Tab:hover": {
            backgroundColor: "#4b5563", // gray-600
          },
          ".Tab--selected": {
            backgroundColor: "#1f2937", // gray-800
            borderColor: "#6b7280", // gray-500
          },
          ".TabIcon": {
            // fill: '#9ca3af', // gray-400 - Adjust icon colors if needed
          },
          ".TabLabel": {
            // color: '#e5e7eb', // gray-200
          },
        };
      }

      setElementsOptions({
        clientSecret: clientSecret,
        appearance: appearance,
      });
    } else {
      setElementsOptions(undefined);
    }
    // Dependency array includes theme now
  }, [clientSecret, theme]);

  // --- Loading / Error / Empty Cart States ---
  if (isCartLoading || (items.length > 0 && isInitializing)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Error initializing checkout: {loadingError}
      </div>
    );
  }

  if (items.length === 0 && !isCartLoading) {
    // Check loading state here too
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  if (!clientSecret || !elementsOptions) {
    // This indicates an issue fetching the client secret after confirming cart has items
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Could not initialize payment process. Please check your connection or
        contact support.
      </div>
    );
  }
  // --- End Loading / Error States ---

  return (
    // Pass the correctly typed options
    <Elements options={elementsOptions} stripe={stripePromise}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">CHECKOUT</h1>
          <Link href="/cart" className="flex items-center">
            <Button variant="outline" size="icon" aria-label="Back to Cart">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CheckoutForm />
          <OrderSummary items={items} totalPrice={totalPrice} />
        </div>
      </div>
    </Elements>
  );
}

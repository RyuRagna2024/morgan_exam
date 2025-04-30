// app/(public)/checkout/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

import OrderSummary from "./OrderSummary";
import CheckoutDetailsActualForm from "./CheckoutDetailsActualForm";
import CheckoutPaymentForm from "./CheckoutPaymentForm";

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions, Appearance } from "@stripe/stripe-js";

// Hooks & Store
import { useCart } from "../productId/cart/_store/use-cart-store-hooks"; // Adjust path
import { useTheme } from "next-themes";
// <<< REMOVED useSession import >>>

// Server Actions & Types
// <<< Import the NEW action >>>
import {
  prepareCheckoutSession,
  getBasicUserInfoForCheckout,
} from "./checkout-actions";
import { getCheckoutPreferences } from "@/app/(customer)/customer/settings/_actions/actions"; // Adjust path
import type { OrderInput } from "./order-types";
import type { UserCheckoutPreference } from "@prisma/client";

// --- Stripe Promise ---
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;
if (!stripePublishableKey) console.error("Stripe Publishable Key is missing.");

// --- Checkout Steps ---
type CheckoutStep = "details" | "payment" | "loading" | "error";

// --- Main Component Content ---
function CheckoutPageContent() {
  const router = useRouter();
  // <<< Removed cartId from destructuring >>>
  const { items, totalPrice, isLoading: isCartLoading } = useCart();
  const { resolvedTheme } = useTheme();
  // <<< REMOVED useSession hook call >>>

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("loading");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [initialDetails, setInitialDetails] =
    useState<Partial<OrderInput> | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [collectedDetails, setCollectedDetails] = useState<OrderInput | null>(
    null,
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [elementsOptions, setElementsOptions] = useState<
    StripeElementsOptions | undefined
  >();

  // --- Effect 1: Load Initial Data & Handle Redirects ---
  useEffect(() => {
    // Wait for cart loading to finish
    if (isCartLoading) return;

    // Check if cart is empty AFTER loading is done
    if (items.length === 0) {
      if (currentStep !== "loading") {
        toast.info("Your cart is empty. Redirecting...");
        router.push("/cart");
      }
      return; // Stop effect if cart is empty
    }

    // Only proceed to load data if in initial loading state and cart has items
    if (currentStep === "loading" && !initialDetails) {
      const loadInitialData = async () => {
        setIsLoadingDetails(true);
        setCheckoutError(null);
        console.log("CheckoutPage: Loading initial data...");

        try {
          // Fetch basic user info first (this also implicitly checks auth)
          const userInfoResult = await getBasicUserInfoForCheckout();

          if (!userInfoResult.success || !userInfoResult.user) {
            // Handle not authenticated or fetch error
            toast.error(
              userInfoResult.error === "User not authenticated."
                ? "Please log in to proceed to checkout."
                : userInfoResult.error || "Failed to get user data.",
            );
            router.push(
              userInfoResult.error === "User not authenticated."
                ? "/login?redirect=/checkout"
                : "/",
            );
            setCurrentStep("error");
            setCheckoutError(
              userInfoResult.error || "Authentication required.",
            );
            return; // Stop execution
          }
          const currentUser = userInfoResult.user; // User is authenticated and data fetched

          // Now fetch preferences (best effort)
          const { preference, error: prefError } =
            await getCheckoutPreferences();
          if (prefError) {
            console.warn(
              "CheckoutPage: Could not load preferences:",
              prefError,
            );
            // Non-fatal, we can proceed with user data as fallback
            toast.info(
              "Could not load saved preferences, using account details.",
            );
          }

          // Construct defaults using fetched user info and preferences
          const defaults: Partial<OrderInput> = {
            firstName: preference?.firstName ?? currentUser.firstName ?? "",
            lastName: preference?.lastName ?? currentUser.lastName ?? "",
            email: preference?.email ?? currentUser.email ?? "",
            phone: preference?.phone ?? currentUser.phoneNumber ?? "",
            companyName: preference?.companyName ?? "", // May be empty
            // Use correct fallback fields from currentUser (BasicUserInfo)
            countryRegion:
              preference?.countryRegion ?? currentUser.country ?? "ZA",
            streetAddress:
              preference?.streetAddress ?? currentUser.streetAddress ?? "",
            apartmentSuite:
              preference?.apartmentSuite ?? currentUser.suburb ?? "", // Map preference `apartmentSuite` or user `suburb`
            townCity: preference?.townCity ?? currentUser.townCity ?? "",
            postcode: preference?.postcode ?? currentUser.postcode ?? "",
            province: preference?.province ?? "", // No direct fallback in BasicUserInfo? Add if needed.
            // Initialize other fields
            captivityBranch: "",
            methodOfCollection: "",
            agreeTerms: false,
          };
          setInitialDetails(defaults);
          setCurrentStep("details"); // Move to Step 1
        } catch (error: any) {
          console.error("CheckoutPage: Failed loadInitialData:", error);
          setCheckoutError(
            "Could not load checkout details. Please try refreshing.",
          );
          setCurrentStep("error");
          toast.error("Failed to load checkout data.");
        } finally {
          setIsLoadingDetails(false);
        }
      };
      loadInitialData();
    } else if (currentStep === "loading" && initialDetails) {
      setCurrentStep("details"); // Move to details if somehow stuck
      setIsLoadingDetails(false);
    }

    // Dependencies: Run when cart stops loading, or if currentStep/initialDetails need resetting.
    // Avoid depending on items directly unless item count change should trigger reload.
  }, [isCartLoading, currentStep, initialDetails, router, items.length]);

  // --- Handler for Step 1 (Details) Form Submission ---
  const handleDetailsSubmit = useCallback(async (data: OrderInput) => {
    // ... (keep this function exactly as before) ...
    console.log("CheckoutPage: Step 1 submitted. Preparing payment intent...");
    setCollectedDetails(data);
    setCurrentStep("loading");
    setIsPreparingPayment(true);
    setCheckoutError(null);
    setClientSecret(null);
    try {
      const result = await prepareCheckoutSession(data);
      if (result.success && result.clientSecret) {
        console.log("CheckoutPage: PaymentIntent prepared successfully.");
        setClientSecret(result.clientSecret);
        setCurrentStep("payment");
      } else {
        console.error(
          "CheckoutPage: Failed prepareCheckoutSession:",
          result.error,
        );
        setCheckoutError(result.error || "Failed to initialize payment step.");
        toast.error(result.error || "Failed to initialize payment step.");
        setCurrentStep("details");
      }
    } catch (error: any) {
      console.error("Error calling prepareCheckoutSession:", error);
      setCheckoutError("An unexpected error occurred while preparing payment.");
      toast.error("An unexpected server error occurred.");
      setCurrentStep("details");
    } finally {
      setIsPreparingPayment(false);
    }
  }, []);

  // --- Effect 2: Configure Stripe Elements Options ---
  useEffect(() => {
    // ... (keep this effect exactly as before, configuring appearance based on theme) ...
    if (clientSecret) {
      console.log("CheckoutPage: Configuring Stripe Elements Appearance...");
      const appearance: Appearance = {
        theme: resolvedTheme === "dark" ? "night" : "stripe",
        variables: { colorPrimary: "#0ea5e9" /* ... */ },
        rules: {
          /* ... */
        },
      };
      if (resolvedTheme === "dark") {
        /* ... apply dark theme overrides ... */
      }
      setElementsOptions({ clientSecret, appearance });
    } else {
      setElementsOptions(undefined);
    }
  }, [clientSecret, resolvedTheme]);

  // --- Loading / Error / Render Logic ---
  const isLoadingPage =
    currentStep === "loading" || isCartLoading || isLoadingDetails;

  if (isLoadingPage) {
    // ... (keep your existing loading skeleton/spinner JSX) ...
    return (
      <div className="container mx-auto px-4 py-8">
        {" "}
        {/* ... Skeleton JSX ... */}{" "}
      </div>
    );
  }

  if (currentStep === "error") {
    // ... (keep your existing error display JSX) ...
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {" "}
        {/* ... Error JSX ... */}{" "}
      </div>
    );
  }

  // --- Main Page Render ---
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">CHECKOUT</h1>
        {(currentStep === "details" || currentStep === "payment") && (
          <Button variant="outline" size="icon" /* ... onClick logic ... */>
            {" "}
            <ArrowLeft className="h-4 w-4" />{" "}
          </Button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Forms Area */}
        <div className="lg:col-span-2">
          {currentStep === "details" && initialDetails && (
            <CheckoutDetailsActualForm
              initialData={initialDetails}
              onSubmit={handleDetailsSubmit}
              isSubmitting={isPreparingPayment}
            />
          )}
          {currentStep === "payment" &&
            clientSecret &&
            elementsOptions &&
            stripePromise && (
              <Elements
                key={clientSecret}
                options={elementsOptions}
                stripe={stripePromise}
              >
                <CheckoutPaymentForm />
              </Elements>
            )}
          {currentStep === "payment" &&
            (!clientSecret || !elementsOptions || !stripePromise) && (
              <Card> {/* ... Payment Error/Loading State ... */} </Card>
            )}
        </div>

        {/* Order Summary */}
        {items &&
          items.length > 0 && ( // Only render summary if items exist
            <OrderSummary items={items} totalPrice={totalPrice} />
          )}
      </div>
    </div>
  );
}

// --- Wrap main content in Suspense for useSearchParams ---
export default function CheckoutPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-20 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

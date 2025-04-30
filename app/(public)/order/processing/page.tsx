// app/(public)/order/processing/page.tsx
"use client";

import React, {
  useEffect,
  useState,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Use from next/navigation
import { Loader2, CheckCircle, AlertTriangle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path if needed
import Link from "next/link";
import { toast } from "sonner"; // Or react-hot-toast

// Import the server action and type
import { getOrderStatusByPaymentIntent } from "@/app/(public)/checkout/checkout-actions"; // Adjust path
import type { OrderStatusResult } from "@/app/(public)/checkout/order-types"; // Adjust path

// Import the useCart hook
import { useCart } from "@/app/(public)/productId/cart/_store/use-cart-store-hooks"; // Adjust path

// Type import for CartState (optional if simplified useCart call works, but good practice)
// import type { CartState } from '@/app/(public)/productId/cart/_store/cart-store'; // Adjust path

// This inner component uses the hooks that require Suspense
function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Corrected: No arguments
  const paymentIntentId = searchParams.get("payment_intent");

  // --- Simplified useCart Call (Recommended approach from previous step) ---
  const cartHookResult = useCart();
  const clearCart = cartHookResult.clearCart; // Access clearCart directly

  // Optional: Log to verify clearCart type during development
  useEffect(() => {
    console.log("ProcessingPage - Type of clearCart:", typeof clearCart);
  }, [clearCart]);

  // State variables
  const [status, setStatus] = useState<
    "processing" | "completed" | "failed" | "idle"
  >("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10; // e.g., 10 attempts * 3s = 30 seconds total polling
  const pollInterval = 3000; // 3 seconds

  // Ref to store the timeout ID for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use useCallback to memoize checkStatus
  const checkStatus = useCallback(
    async (currentAttempt: number) => {
      if (!paymentIntentId) {
        setStatus("failed");
        setErrorMessage("Payment information missing.");
        return;
      }
      // Prevent further checks if status is already finalized
      if (status === "completed" || status === "failed") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        return;
      }

      console.log(
        `ProcessingPage: Checking status for PI ${paymentIntentId}, Attempt ${currentAttempt}`,
      );
      setAttempts(currentAttempt); // Update attempt count

      try {
        const result: OrderStatusResult =
          await getOrderStatusByPaymentIntent(paymentIntentId);

        // Check if component might have unmounted while waiting
        if (timeoutRef.current === null && currentAttempt > 1) {
          console.log(
            "ProcessingPage: Polling stopped by cleanup during await.",
          );
          return;
        }

        setOrderId(result.orderId ?? null);

        if (result.success) {
          // Check for success state (completed OR processing with an orderId)
          if (
            (result.status === "completed" || result.status === "processing") &&
            result.orderId
          ) {
            console.log(
              `ProcessingPage: Status '${result.status}' found for Order ${result.orderId}. Clearing client cart & redirecting...`,
            );
            setStatus("completed"); // Set final UI state to completed
            if (timeoutRef.current) clearTimeout(timeoutRef.current); // Stop polling
            timeoutRef.current = null; // Mark as stopped

            // --- Call clearCart ---
            if (typeof clearCart === "function") {
              // Check if it's a function
              try {
                await clearCart(); // Assuming clearCart might be async based on store def
                console.log("ProcessingPage: Client-side cart cleared.");
              } catch (clearError) {
                console.error(
                  "ProcessingPage: Error clearing client cart:",
                  clearError,
                );
                toast.error("Failed to sync cart state."); // Inform user
              }
            } else {
              console.warn(
                "ProcessingPage: clearCart is not a function!",
                clearCart,
              );
              toast.error("Cart sync error.");
            }
            // --- End clearCart call ---

            toast.success(
              result.status === "completed"
                ? "Order confirmed!"
                : "Payment successful! Your order is being processed.",
            );
            router.replace(`/order/confirmation/${result.orderId}`); // Redirect
          } else if (result.status === "failed") {
            console.log(
              `ProcessingPage: Status failed for PI ${paymentIntentId}. Error: ${result.error}`,
            );
            setStatus("failed");
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            setErrorMessage(result.error || "Order processing failed.");
            toast.error(result.error || "Order processing failed.");
          } else if (result.status === "processing") {
            // Still processing (or orderId not found yet by the action)
            console.log(
              `ProcessingPage: Status still processing (Order ID: ${result.orderId ?? "Not Found Yet"}).`,
            );
            if (currentAttempt >= maxAttempts) {
              console.warn(
                `ProcessingPage: Max attempts reached for PI ${paymentIntentId}.`,
              );
              setStatus("failed");
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
              setErrorMessage(
                "Order confirmation is taking longer than expected. Please check 'My Orders' or contact support.",
              );
              toast.warning("Order confirmation delayed.");
            } else {
              // Schedule the NEXT check only if still processing and not maxed out
              console.log(
                `ProcessingPage: Scheduling next check in ${pollInterval}ms`,
              );
              if (timeoutRef.current) clearTimeout(timeoutRef.current); // Clear previous before setting new
              timeoutRef.current = setTimeout(() => {
                // Check ref again before recursive call
                if (timeoutRef.current !== null) {
                  checkStatus(currentAttempt + 1);
                }
              }, pollInterval);
            }
          } else {
            // Handles 'not_found' or any unexpected status string from action
            console.error(
              `ProcessingPage: Unknown or invalid status '${result.status}' for PI ${paymentIntentId}.`,
            );
            setStatus("failed");
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            setErrorMessage(
              `Order status check returned: ${result.status}. Contact support.`,
            );
            toast.error(`Unexpected order status: ${result.status}.`);
          }
        } else {
          // The getOrderStatusByPaymentIntent action itself failed
          console.error(
            `ProcessingPage: Action failed for PI ${paymentIntentId}: ${result.error}`,
          );
          setStatus("failed");
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          setErrorMessage(result.error || "Failed check status.");
          toast.error(result.error || "Error checking status.");
        }
      } catch (error) {
        // Handle errors from the async call itself
        console.error("ProcessingPage: Error calling checkStatus:", error);
        if (timeoutRef.current !== null || currentAttempt === 1) {
          // Allow setting error on first attempt
          setStatus("failed");
          setErrorMessage("Unexpected error checking status.");
          toast.error("Unexpected error.");
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // Ensure polling stops on error
        timeoutRef.current = null;
      }
      // Include dependencies for useCallback
    },
    [paymentIntentId, router, maxAttempts, pollInterval, clearCart, status],
  ); // Added status to dependencies

  // --- Effect to start polling ---
  useEffect(() => {
    let isMounted = true; // Flag for cleanup safety
    // Start the first check only if we have an ID and are in the initial 'idle' state
    if (paymentIntentId && status === "idle" && isMounted) {
      setStatus("processing");
      // Use a ref to track if the effect has already initiated polling
      // This helps prevent duplicate starts if dependencies change rapidly
      if (timeoutRef.current === null) {
        // Only start if not already started/cleaned up
        // Set a dummy timeout ID immediately so cleanup knows polling might be active
        // and checkStatus knows it's okay to potentially schedule the next one
        timeoutRef.current = setTimeout(() => {}, 0);
        checkStatus(1); // Start the first check
      }
    } else if (!paymentIntentId && status === "idle" && isMounted) {
      // Handle missing ID on initial load
      setStatus("failed");
      setErrorMessage("Payment information missing from URL.");
      toast.error("Invalid page access.");
      console.error("ProcessingPage: payment_intent missing on mount!");
    }

    // --- Cleanup function ---
    // Clears the timeout when the component unmounts or dependencies change causing effect rerun
    return () => {
      isMounted = false; // Set flag
      console.log("ProcessingPage: Cleanup effect running.");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log("ProcessingPage: Cleared timeout on unmount/re-run.");
      }
      timeoutRef.current = null; // Signal that polling should stop / cleanup ran
    };
    // Depend on paymentIntentId and status to start/restart effect correctly
    // checkStatus is memoized by useCallback
  }, [paymentIntentId, status, checkStatus]);

  // --- Render UI based on the status ---
  return (
    <div className="container mx-auto py-16 sm:py-20 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Idle/Processing State */}
      {(status === "idle" || status === "processing") && (
        <>
          <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-primary mb-6" />
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-foreground">
            {status === "idle" ? "Initializing..." : "Processing Your Order"}
          </h1>
          <p className="text-muted-foreground max-w-md">
            {status === "idle"
              ? "Loading payment details..."
              : "Please wait while we confirm your payment and finalize your order details. This page will update automatically."}
          </p>
          {status === "processing" && attempts > 2 && (
            <p className="text-xs text-muted-foreground mt-4">
              (Checking status... Please wait)
            </p>
          )}
        </>
      )}
      {/* Completed State */}
      {status === "completed" && (
        <>
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-6" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-green-600 mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Order confirmed! Redirecting you shortly...
          </p>
          {orderId && (
            <Link href={`/order/confirmation/${orderId}`}>
              <Button>View Order Confirmation</Button>
            </Link>
          )}
        </>
      )}
      {/* Failed State */}
      {status === "failed" && (
        <>
          <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive mb-6" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-destructive mb-2">
            Order Processing Issue
          </h1>
          <p className="text-muted-foreground mb-6 max-w-md whitespace-pre-wrap">
            {errorMessage ||
              "There was an issue confirming your order after payment."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/customer/orders">
              <Button variant="outline">
                {" "}
                <ShoppingBag className="mr-2 h-4 w-4" /> View My Orders
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Contact Support</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// --- Suspense Wrapper ---
// Wraps the main content component to handle loading states for hooks like useSearchParams
export default function ProcessingPage() {
  return (
    // <<< Replaced comment with actual Fallback JSX >>>
    <Suspense
      fallback={
        // Provide the actual JSX for the loading state here
        <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[70vh] text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <h1 className="text-3xl font-semibold mb-2">
            Loading Payment Status...
          </h1>
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
    // <<< End Correction >>>
  );
}

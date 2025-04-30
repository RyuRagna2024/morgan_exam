// app/(public)/order/processing/page.tsx
"use client";

import React, {
  useEffect,
  useState,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertTriangle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path if needed
import Link from "next/link";
import { toast } from "sonner"; // Or react-hot-toast

// Import the server action and type
import { getOrderStatusByPaymentIntent } from "@/app/(public)/checkout/checkout-actions"; // Adjust path
import type { OrderStatusResult } from "@/app/(public)/checkout/order-types"; // Adjust path

// This inner component uses the hooks that require Suspense
function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");

  // State variables
  const [status, setStatus] = useState<
    "processing" | "completed" | "failed" | "idle"
  >("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10; // Max polling attempts
  const pollInterval = 3000; // Poll every 3 seconds

  // Ref to store the timeout ID for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use useCallback to memoize checkStatus
  const checkStatus = useCallback(
    async (currentAttempt: number) => {
      if (!paymentIntentId) {
        setStatus("failed");
        setErrorMessage("Payment info missing.");
        return;
      }

      console.log(
        `ProcessingPage: Checking status for PI ${paymentIntentId}, Attempt ${currentAttempt}`,
      );
      setAttempts(currentAttempt);

      try {
        const result: OrderStatusResult =
          await getOrderStatusByPaymentIntent(paymentIntentId);

        // Check if component might have unmounted while waiting
        // If timeoutRef is null, it means cleanup ran.
        if (timeoutRef.current === null && currentAttempt > 1) return;

        setOrderId(result.orderId ?? null); // Store orderId if found

        if (result.success) {
          // --- <<< MODIFICATION START: Treat 'processing' as success for redirect >>> ---
          if (
            (result.status === "completed" || result.status === "processing") &&
            result.orderId
          ) {
            // If status is 'completed' OR 'processing' (meaning webhook likely ran) AND we have an order ID
            console.log(
              `ProcessingPage: Status '${result.status}' found for Order ${result.orderId}. Redirecting...`,
            );
            setStatus("completed"); // Set final UI state to completed
            if (timeoutRef.current) clearTimeout(timeoutRef.current); // Stop polling
            timeoutRef.current = null; // Mark as stopped
            toast.success(
              result.status === "completed"
                ? "Order confirmed!"
                : "Payment successful! Your order is being processed.",
            );
            router.replace(`/order/confirmation/${result.orderId}`); // Redirect to confirmation
          }
          // --- <<< MODIFICATION END >>> ---
          else if (result.status === "failed") {
            // Handle explicit failure states
            console.log(
              `ProcessingPage: Status failed for PI ${paymentIntentId}. Error: ${result.error}`,
            );
            setStatus("failed");
            if (timeoutRef.current) clearTimeout(timeoutRef.current); // Stop polling
            timeoutRef.current = null;
            setErrorMessage(result.error || "Order processing failed.");
            toast.error(result.error || "Order processing failed.");
          }
          // Note: The explicit 'processing' check below is now less likely to be the main path
          // for continuing polling, as the block above catches it for redirection.
          // It only matters if getOrderStatusByPaymentIntent returns 'processing' *without* an orderId
          // (meaning webhook hasn't created the DB record yet).
          else if (result.status === "processing") {
            console.log(
              `ProcessingPage: Status still processing (Order ID: ${result.orderId ?? "Not Found Yet"}).`,
            );
            if (currentAttempt >= maxAttempts) {
              console.warn(
                `ProcessingPage: Max attempts reached for PI ${paymentIntentId}.`,
              );
              setStatus("failed");
              if (timeoutRef.current) clearTimeout(timeoutRef.current); // Stop polling
              timeoutRef.current = null;
              setErrorMessage(
                "Order confirmation is taking longer than expected. Check 'My Orders' or contact support.",
              );
              toast.warning("Order confirmation delayed.");
            } else {
              // Schedule the NEXT check only if still processing and not maxed out
              console.log(
                `ProcessingPage: Scheduling next check in ${pollInterval}ms`,
              );
              // Clear previous timeout just in case, before setting a new one
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => {
                // Check ref again before recursive call
                if (timeoutRef.current !== null) {
                  checkStatus(currentAttempt + 1);
                }
              }, pollInterval);
            }
          } else {
            // Handles 'not_found' or any unexpected status string
            console.error(
              `ProcessingPage: Unknown or invalid status '${result.status}' for PI ${paymentIntentId}.`,
            );
            setStatus("failed");
            if (timeoutRef.current) clearTimeout(timeoutRef.current); // Stop polling
            timeoutRef.current = null;
            setErrorMessage(
              `Order status check returned: ${result.status}. Please contact support.`,
            );
            toast.error(`Unexpected order status: ${result.status}.`);
          }
        } else {
          // The getOrderStatusByPaymentIntent action itself failed
          console.error(
            `ProcessingPage: Action failed for PI ${paymentIntentId}: ${result.error}`,
          );
          setStatus("failed");
          if (timeoutRef.current) clearTimeout(timeoutRef.current); // Stop polling
          timeoutRef.current = null;
          setErrorMessage(result.error || "Failed to check order status.");
          toast.error(result.error || "Error checking status.");
        }
      } catch (error) {
        console.error("ProcessingPage: Error calling checkStatus:", error);
        // Check ref before setting state in catch block
        if (timeoutRef.current !== null || currentAttempt === 1) {
          setStatus("failed");
          setErrorMessage("Unexpected error checking status.");
          toast.error("Unexpected error.");
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // Stop polling on error
        timeoutRef.current = null;
      }
    },
    [paymentIntentId, router, maxAttempts, pollInterval],
  ); // Dependencies for useCallback

  // --- Effect to start and manage polling ---
  useEffect(() => {
    // Start the first check only if we have an ID and are idle
    if (paymentIntentId && status === "idle") {
      setStatus("processing");
      // Set a dummy timeout ID immediately so cleanup knows polling might be active
      timeoutRef.current = setTimeout(() => {}, 0); // Will be cleared/replaced
      checkStatus(1); // Start the first check
    } else if (!paymentIntentId && status === "idle") {
      // Handle missing ID on initial load
      setStatus("failed");
      setErrorMessage("Payment information missing from URL.");
      toast.error("Invalid page access.");
      console.error("ProcessingPage: payment_intent missing on mount!");
    }

    // --- Cleanup function ---
    return () => {
      console.log("ProcessingPage: Cleanup effect running.");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log("ProcessingPage: Cleared timeout on unmount/re-run.");
      }
      timeoutRef.current = null; // Signal that polling should stop
    };
    // Depend only on paymentIntentId and the checkStatus callback itself
    // Status is managed internally by the checkStatus logic now
  }, [paymentIntentId, checkStatus, status]); // Include status to handle reset to idle?

  // --- Render UI based on the status ---
  return (
    <div className="container mx-auto py-16 sm:py-20 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Show initial loading/idle state */}
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

      {/* Show brief success message before redirect */}
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

      {/* Show failure message */}
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
            <Link href="/orders">
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

// Wrap with Suspense because ProcessingContent uses useSearchParams
export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
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
  );
}

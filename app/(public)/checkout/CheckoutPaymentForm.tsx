// app/(public)/checkout/CheckoutPaymentForm.tsx
"use client";

import React, { useState } from "react";
// --- Stripe Imports ---
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
// Components
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Use sonner or react-hot-toast
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

interface CheckoutPaymentFormProps {
  // No props strictly needed, but could receive clientSecret or options if needed later
}

export default function CheckoutPaymentForm({}: CheckoutPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // For displaying Stripe errors

  // Customize the Payment Element appearance and layout
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs", // 'tabs', 'accordion', 'auto'
    // Add other options like defaultValues if collecting billing details here
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null); // Clear previous errors

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      toast.error("Payment components not ready. Please wait or refresh.");
      return;
    }

    setIsProcessing(true);
    // Don't show loading toast here, as browser navigation should occur
    // toast.loading("Processing payment...", { id: 'payment-process' });

    // Trigger the payment confirmation
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // --- IMPORTANT: URL where Stripe redirects after payment attempt ---
        // This page will handle checking the payment status and redirecting further.
        return_url: `${window.location.origin}/order/processing`, // Use your processing page route
      },
      // redirect: 'if_required' // This is the default, Stripe handles redirect
    });

    // If `confirmPayment` fails immediately (client-side validation, network error, etc.)
    // Usually this point isn't reached if the card details are okay, as Stripe redirects.
    // toast.dismiss('payment-process'); // Dismiss loading toast if shown
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(
          error.message || "Payment failed. Please check your card details.",
        );
        toast.error(error.message || "Payment failed. Check card details.");
      } else {
        setMessage("An unexpected error occurred. Please try again.");
        toast.error("An unexpected payment error occurred.");
      }
      console.error("Stripe confirmPayment error:", error);
      setIsProcessing(false); // Allow user to retry if immediate error
    }
    // If no error, the browser is navigating to return_url. Keep isProcessing true visually.
    // The button remains disabled while the page navigates away.
  };

  return (
    // The parent page provides the overall layout structure
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* The Stripe Payment Element includes card fields, etc. */}
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
          />
        </CardContent>
      </Card>

      {/* Display Stripe validation/card errors */}
      {message && (
        <div
          id="payment-message"
          className="text-sm p-3 rounded-md border border-destructive bg-destructive/10 text-destructive"
        >
          {message}
        </div>
      )}

      {/* Footer with Pay Now button */}
      <Card>
        <CardFooter className="p-6">
          <Button
            type="submit"
            className="w-full px-8 ml-auto" // Full width or auto as needed
            // Disable button if Stripe isn't loaded or payment is processing
            disabled={!stripe || !elements || isProcessing}
          >
            {isProcessing ? (
              <>
                {" "}
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                Payment...{" "}
              </>
            ) : (
              `Pay Now`
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

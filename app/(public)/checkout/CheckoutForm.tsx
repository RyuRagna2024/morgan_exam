// app/(public)/checkout/CheckoutForm.tsx
"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import Link from "next/link";

// --- Stripe Imports ---
import {
  PaymentElement,
  LinkAuthenticationElement, // Optional: Email input managed by Stripe
  AddressElement,           // Optional: Address collection managed by Stripe
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions, StripeAddressElementOptions } from '@stripe/stripe-js';
// --- End Stripe Imports ---

// Components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card components

// Removed imports related to react-hook-form and old schemas

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Optional: State for non-stripe fields if you keep them separate
  const [orderNotes, setOrderNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Define options for Payment Element
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs", // or "accordion" or { type: 'tabs', defaultCollapsed: false }
  };

  // Define options for Address Element (if used)
  const addressElementOptions: StripeAddressElementOptions = {
    mode: 'shipping', // or 'billing'
    // You can pre-fill address details here if needed
    // defaultValues: { name: '...', address: { ... } },
    allowedCountries: ['ZA', 'US', 'GB'], // Example: Restrict countries
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      toast.error("Payment components not ready.");
      return;
    }

    // --- Validate non-Stripe fields ---
    if (!agreeTerms) {
        toast.error("Please agree to the terms and conditions.");
        return;
    }
    // --- End Validation ---


    setIsProcessing(true);
    setMessage(null); // Clear previous messages
    toast.loading("Processing payment...", { id: 'payment-process' });

    // Trigger payment confirmation using stripe.confirmPayment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // --- IMPORTANT: Set the success URL ---
        return_url: `${window.location.origin}/order/success`,
        // Optional: If using AddressElement for shipping, Stripe might automatically
        // include it. If collecting manually, pass it here:
        // shipping: {
        //   name: 'Customer Name', // Get from form state or prefill
        //   address: { /* ... address fields ... */ },
        // },
      },
    });

    toast.dismiss('payment-process');

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "Payment failed. Please check your details.");
            toast.error(error.message || "Payment failed.");
        } else {
            setMessage("An unexpected error occurred during payment.");
            toast.error("An unexpected error occurred.");
        }
        console.error("Stripe confirmPayment error:", error);
    } else {
      // Should not happen if redirect occurs, but log just in case
      console.log("Stripe confirmPayment submitted, awaiting redirect or webhook.");
      setMessage("Processing complete. Awaiting final confirmation..."); // User might see this briefly before redirect
    }

    setIsProcessing(false); // Re-enable button only if error occurred *before* redirect attempt
  };

  return (
    // Use a standard form element, NO react-hook-form Form provider needed
    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

       {/* Optional: Collect email via Stripe */}
       {/* <Card>
           <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
           <CardContent><LinkAuthenticationElement id="link-authentication-element" /></CardContent>
       </Card> */}

       {/* Optional: Collect Address via Stripe */}
        {/* <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent><AddressElement id="address-element" options={addressElementOptions} /></CardContent>
        </Card> */}

       {/* --- Payment Element --- */}
       <Card>
           <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
           <CardContent>
               <PaymentElement id="payment-element" options={paymentElementOptions} />
           </CardContent>
       </Card>

      {/* Add back any NON-STRIPE fields here */}
      <Card>
           <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
           <CardContent>
               <div className="space-y-1">
                  <Label htmlFor="orderNotes">Order Notes (optional)</Label>
                  <Textarea
                      id="orderNotes"
                      placeholder="Notes about your order..."
                      className="min-h-[80px]"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      disabled={isProcessing}
                  />
               </div>
               {/* Add other non-address/payment fields here (e.g., Branch Select) */}
           </CardContent>
       </Card>

      {/* Terms Section */}
       <Card>
            <CardContent className="p-6">
                 <p className="text-sm text-gray-600 mb-4">Your personal data will be used to process your order...</p>
                 <div className="flex items-center space-x-3">
                     <Checkbox
                         id="agreeTerms"
                         checked={agreeTerms}
                         onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                         disabled={isProcessing}
                      />
                      <Label
                          htmlFor="agreeTerms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                       >
                          I have read and agree to the website terms and conditions*
                      </Label>
                 </div>
                 {/* Display validation message locally if terms not checked? */}
                 {!agreeTerms && isProcessing === false /* only show if trying to submit? */ && (
                    <p className="text-sm text-red-600 mt-2">You must agree to the terms.</p>
                 )}
            </CardContent>
        </Card>

      {/* Display Payment Error Messages */}
      {message && <div id="payment-message" className="text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded-md">{message}</div>}

       {/* Warning Note */}
       {/* <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md"><p className="text-amber-800 text-sm">Note...</p></div> */}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Link href="/cart" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full px-8" type="button" disabled={isProcessing}> Back to Cart </Button>
        </Link>
        <Button
           type="submit"
           className="w-full sm:w-auto px-8"
           // Disable button if Stripe isn't loaded, processing, or terms not agreed
           disabled={!stripe || !elements || isProcessing || !agreeTerms}
         >
          {isProcessing ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing... </> ) : ( `Pay Now` )} {/* Simpler button text */}
        </Button>
      </div>
    </form>
  );
}
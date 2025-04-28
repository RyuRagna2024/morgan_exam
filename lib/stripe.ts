// lib/stripe.ts
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error(
    "FATAL ERROR: STRIPE_SECRET_KEY environment variable is not set.",
  );
  throw new Error(
    "Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your environment variables.",
  );
}

export const stripe = new Stripe(stripeSecretKey, {
  // --- Use the specific version TypeScript demands ---
  apiVersion: "2025-03-31.basil",
  // --- End Change ---
  typescript: true,
});

if (process.env.NODE_ENV === "development") {
  console.log("Stripe client initialized successfully.");
}

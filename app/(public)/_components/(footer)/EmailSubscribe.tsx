// app/(public)/_components/(footer)/EmailSubscribe.tsx
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeToNewsletter } from "./newletter-actions"; // Action remains the same

function SubscribeButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      // Keep gradient as accent? Or use theme primary? text-primary-foreground?
      // Option 1: Keep gradient (works okay on light/dark)
      className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-md px-6 py-2 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      // Option 2: Use theme primary (consistent with Shadcn)
      // className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Subscribing..." : "Subscribe"}
    </button>
  );
}

export default function EmailSubscribe() {
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({ text: "", type: null });

  async function handleSubscribe(formData: FormData) {
    setMessage({ text: "", type: null }); // Clear previous message
    const response = await subscribeToNewsletter(formData);

    if (response.success) {
      setMessage({
        text: "Successfully subscribed!", // Simplified message
        type: "success",
      });
      // Optionally clear the form
      const form = document.getElementById("subscribe-form") as HTMLFormElement;
      form?.reset(); // Reset form fields on success
    } else {
      setMessage({
        text: response.error || "Failed to subscribe. Please try again.", // User-friendly error
        type: "error",
      });
    }
  }

  return (
    // Use theme text colors
    <div className="space-y-3">
      {" "}
      {/* Adjusted spacing */}
      <h3 className="font-medium text-sm text-foreground">Stay updated</h3>
      <form id="subscribe-form" action={handleSubscribe} className="space-y-2">
        <div className="flex gap-2 max-w-md">
          <label htmlFor="newsletter-email" className="sr-only">
            Enter your email
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="Enter your email"
            // Use theme variables for input styling
            className="flex-1 rounded-md border border-input bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            required
          />
          <SubscribeButton />
        </div>
        {/* Status message styling */}
        {message.text && (
          <p
            className={`text-xs pt-1 ${
              // Adjusted size/padding
              message.type === "success"
                ? "text-green-600 dark:text-green-500"
                : "text-destructive" // Use theme destructive color
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}

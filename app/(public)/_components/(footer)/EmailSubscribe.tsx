// components/EmailSubscribe.tsx
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeToNewsletter } from "./newletter-actions";

function SubscribeButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-md px-6 py-2 text-sm font-medium transition-all duration-300 disabled:opacity-50"
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
    setMessage({ text: "", type: null });

    const response = await subscribeToNewsletter(formData);

    if (response.success) {
      setMessage({
        text: "Successfully subscribed to newsletter!",
        type: "success",
      });
      // Clear the input
      const form = document.getElementById("subscribe-form") as HTMLFormElement;
      form?.reset();
    } else {
      setMessage({
        text: response.error || "Failed to subscribe",
        type: "error",
      });
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-white">Stay updated</h3>
      <form id="subscribe-form" action={handleSubscribe} className="space-y-2">
        <div className="flex gap-2 max-w-md">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder:text-gray-400"
            required
          />
          <SubscribeButton />
        </div>
        {message.text && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}

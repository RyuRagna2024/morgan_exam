"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paperclip } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter
import toast from "react-hot-toast"; // Import toast
import { submitSupportRequest } from "../_actions/submit-support-request";
import { useSession } from "@/app/(customer)/SessionProvider";

interface SupportFormProps {}

export default function SupportForm({}: SupportFormProps) {
  const { user } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter(); // Initialize router

  // ... (state variables remain the same: title, name, email, message, attachment, etc.) ...
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // ... (useEffect for name/email remains the same) ...
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setName(fullName || user.username || "");
      setEmail(user.email || "");
    } else {
      setName("");
      setEmail("");
    }
  }, [user]);

  // ... (handleFileChange, handleAttachmentClick remain the same) ...
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachment(file);
      setAttachmentName(file.name);
    } else {
      setAttachment(null);
      setAttachmentName("");
    }
  };
  const handleAttachmentClick = () => {
    document.getElementById("support-attachment-input")?.click();
  };

  // --- UPDATED handleSubmit ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" }); // Clear previous status message on new submit

    if (!user || !formRef.current) {
      setSubmitStatus({
        type: "error",
        message: !user ? "You must be logged in." : "Form error.",
      });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(formRef.current);

    // Display pending toast
    const loadingToastId = toast.loading("Sending message...");

    try {
      const result = await submitSupportRequest(formData);

      toast.dismiss(loadingToastId); // Dismiss loading toast

      if (result.success) {
        // Show success toast
        toast.success("Message Sent Successfully!", { duration: 2000 }); // Show for 2 seconds

        // Reset form using ref after successful submission
        if (formRef.current) {
          formRef.current.reset();
          // Clear state associated with form that reset doesn't handle (file)
          setAttachment(null);
          setAttachmentName("");
          setTitle(""); // Also clear controlled state
          setMessage("");
          // Re-populate name/email if needed (useEffect might handle this)
          if (user) {
            const fullName =
              `${user.firstName || ""} ${user.lastName || ""}`.trim();
            setName(fullName || user.username || "");
            setEmail(user.email || "");
          }
        }

        // Redirect after a delay (matching toast duration)
        setTimeout(() => {
          router.push("/customer/mymessages"); // Redirect to the messages list
          // Optionally refresh data if needed, though push usually triggers reload
          // router.refresh(); // Use if you want to force a data refresh
        }, 2000); // 2 second delay
      } else {
        // Show error toast from server action message
        toast.error(result.message || "Failed to send message.");
        // Also update the local error state if you still want the inline message
        setSubmitStatus({ type: "error", message: result.message });
      }
    } catch (error) {
      toast.dismiss(loadingToastId); // Dismiss loading toast on error too
      console.error("Error calling submitSupportRequest action:", error);
      const errorMsg = "An unexpected error occurred submitting the form.";
      toast.error(errorMsg);
      setSubmitStatus({ type: "error", message: errorMsg });
    } finally {
      // Ensure submitting state is always turned off
      // We delay this slightly if redirecting on success
      if (submitStatus.type !== "success") {
        setIsSubmitting(false);
      } else {
        // Keep submitting appearance until redirect happens
        // setIsSubmitting will effectively be false on next render anyway
      }
    }
  }; // End of handleSubmit

  // --- JSX Rendering (mostly the same, ensure error message display uses submitStatus) ---
  return (
    <div className="max-w-xl mx-auto p-6 md:p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Contact Support
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {/* ... Input fields for title, name, email, message ... */}
        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject / Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 sm:text-sm px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g., Issue with order #12345"
            disabled={!user || isSubmitting}
          />
        </div>
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 sm:text-sm px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label="Your name"
            disabled={!user || isSubmitting}
          />
        </div>
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 sm:text-sm px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label="Your email"
            disabled={!user || isSubmitting}
          />
        </div>
        {/* Message Textarea */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 sm:text-sm px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Please describe your issue or question in detail..."
            disabled={!user || isSubmitting}
          ></textarea>
        </div>

        {/* Attachment Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachment (Optional - Max 5MB Image)
          </label>
          <input
            type="file"
            id="support-attachment-input"
            name="attachment"
            className="hidden"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={!user || isSubmitting}
            aria-label="Attach an optional image file for the support request (Max 5MB)"
          />
          <button
            type="button"
            onClick={handleAttachmentClick}
            disabled={!user || isSubmitting}
            className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip className="mr-2 -ml-0.5 h-4 w-4" aria-hidden="true" />
            {attachmentName ? "Change File" : "Attach File"}
          </button>
          {attachmentName && (
            <span className="ml-3 text-sm text-gray-600 truncate max-w-xs inline-block align-middle">
              {attachmentName}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={!user || isSubmitting}
            className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>

        {/* Inline Status Message Area - Still useful for persistent errors */}
        {submitStatus.type === "error" && ( // Only show inline message for errors now
          <div
            className={`mt-4 p-3 rounded-md text-sm bg-red-100 text-red-800`}
            role="alert"
          >
            {submitStatus.message}
          </div>
        )}

        {/* Login Prompt */}
        {!user && (
          <div
            className="mt-4 p-3 rounded-md text-sm bg-yellow-100 text-yellow-800 text-center"
            role="alert"
          >
            {" "}
            Please log in to submit a support request.{" "}
          </div>
        )}
      </form>
    </div>
  );
} // End component

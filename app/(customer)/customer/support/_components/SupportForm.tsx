// src/components/customer/SupportForm.tsx (Adjust import paths if necessary)

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paperclip } from "lucide-react";
import { submitSupportRequest } from "../_actions/submit-support-request";
import { useSession } from "@/app/(customer)/SessionProvider";

// Interface for the form props (currently empty as action is imported directly)
interface SupportFormProps {}

export default function SupportForm({}: SupportFormProps) {
  const { user } = useSession();
  const formRef = useRef<HTMLFormElement>(null); // Ref for the form element

  // State for controlled inputs
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null); // State for the selected file object
  const [attachmentName, setAttachmentName] = useState<string>(""); // State for displaying the file name

  // State for submission process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Effect to pre-fill name and email based on user session
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setName(fullName || user.username || "");
      setEmail(user.email || "");
    } else {
      // Clear fields if user logs out
      setName("");
      setEmail("");
    }
  }, [user]); // Dependency: runs when user object changes

  // Handle file selection from the hidden input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Optional: Add client-side validation here (size, type) for immediate feedback
      // e.g., if (file.size > MAX_SIZE) { alert(...); return; }
      setAttachment(file);
      setAttachmentName(file.name);
    } else {
      // Reset if no file is selected (e.g., user cancels file picker)
      setAttachment(null);
      setAttachmentName("");
    }
  };

  // Trigger the click event on the hidden file input
  const handleAttachmentClick = () => {
    document.getElementById("support-attachment-input")?.click();
  };

  // Form submission handler - uses FormData and calls the server action
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default browser form submission
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" }); // Clear previous status

    // Check if user is logged in (button should also be disabled)
    if (!user) {
      setSubmitStatus({ type: "error", message: "You must be logged in." });
      setIsSubmitting(false);
      return;
    }
    // Check if form ref is available
    if (!formRef.current) {
      setSubmitStatus({ type: "error", message: "Form error occurred." });
      setIsSubmitting(false);
      return;
    }

    // Create FormData directly from the form element reference.
    // This automatically includes all inputs with a 'name' attribute.
    const formData = new FormData(formRef.current);

    // --- Server Action Call ---
    try {
      // Call the imported server action function
      const result = await submitSupportRequest(formData);

      if (result.success) {
        setSubmitStatus({ type: "success", message: result.message });
        // Reset form fields on successful submission
        setTitle("");
        setMessage("");
        setAttachment(null);
        setAttachmentName("");
        // Reset the form element itself to clear inputs including the file input
        if (formRef.current) {
          formRef.current.reset();
          // Re-populate name/email after reset as they are controlled by useEffect
          // which will run again due to user state not changing
          if (user) {
            const fullName =
              `${user.firstName || ""} ${user.lastName || ""}`.trim();
            setName(fullName || user.username || "");
            setEmail(user.email || "");
          }
        }
      } else {
        // Display error message from the server action
        setSubmitStatus({ type: "error", message: result.message });
      }
    } catch (error) {
      // Catch unexpected errors during the action call itself
      console.error("Error calling submitSupportRequest action:", error);
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred submitting the form.",
      });
    } finally {
      // Ensure submitting state is turned off regardless of outcome
      setIsSubmitting(false);
    }
  }; // End of handleSubmit

  // --- Render JSX ---
  return (
    <div className="max-w-xl mx-auto p-6 md:p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Contact Support
      </h2>
      {/* Add ref to the form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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
            name="title" // Name attribute for FormData
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
            name="name" // Name attribute for FormData
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
            name="email" // Name attribute for FormData
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
            name="message" // Name attribute for FormData
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
          {/* Hidden File Input with aria-label */}
          <input
            type="file"
            id="support-attachment-input"
            name="attachment" // Name attribute for FormData
            className="hidden" // Visually hide the default input
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif" // Suggest file types
            disabled={!user || isSubmitting}
            aria-label="Attach an optional image file for the support request (Max 5MB)" // Accessibility label
          />
          {/* Button to trigger the hidden file input */}
          <button
            type="button" // Prevent form submission on click
            onClick={handleAttachmentClick}
            disabled={!user || isSubmitting}
            className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip className="mr-2 -ml-0.5 h-4 w-4" aria-hidden="true" />
            {attachmentName ? "Change File" : "Attach File"}
          </button>
          {/* Display selected file name */}
          {attachmentName && (
            <span className="ml-3 text-sm text-gray-600 truncate max-w-xs inline-block align-middle">
              {attachmentName}
            </span>
          )}
        </div>
        {/* --- End Attachment Section --- */}

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

        {/* Status Message Area */}
        {submitStatus.type && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              submitStatus.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
            role="alert" // Indicate purpose for assistive technologies
          >
            {submitStatus.message}
          </div>
        )}

        {/* Login Prompt (shown if user is not logged in) */}
        {!user && (
          <div
            className="mt-4 p-3 rounded-md text-sm bg-yellow-100 text-yellow-800 text-center"
            role="alert"
          >
            Please log in to submit a support request.
          </div>
        )}
      </form>
    </div> // End of main container div
  ); // End of return statement
} // End of component function SupportForm

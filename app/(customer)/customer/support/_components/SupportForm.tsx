// app/(customer)/support/_components/SupportForm.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Loader2 } from "lucide-react"; // Use Loader2 for consistency
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Or sonner
import { submitSupportRequest } from "../_actions/submit-support-request"; // Adjust path if needed
import { useSession } from "@/app/(customer)/SessionProvider"; // Adjust path if needed

// Import shadcn/ui components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For displaying errors/messages

// interface SupportFormProps {} // Not needed if no props

export default function SupportForm() {
  // Removed props
  const { user } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // State for inline error message

  // Auto-fill name/email effect (keep using formRef for this uncontrolled approach)
  useEffect(() => {
    if (user && formRef.current) {
      const nameInput = formRef.current.elements.namedItem(
        "name",
      ) as HTMLInputElement;
      const emailInput = formRef.current.elements.namedItem(
        "email",
      ) as HTMLInputElement;
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      if (nameInput) nameInput.value = fullName || user.username || "";
      if (emailInput) emailInput.value = user.email || "";
    }
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic client-side validation (optional, server validates too)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (file.size > MAX_SIZE) {
        toast.error("File is too large (Max 5MB).");
        event.target.value = ""; // Clear selection
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Invalid file type. Only images are allowed.");
        event.target.value = ""; // Clear selection
        return;
      }
      setAttachment(file);
      setAttachmentName(file.name);
    } else {
      setAttachment(null);
      setAttachmentName("");
    }
    // Clear file input value to allow re-selecting same file later if needed
    // Note: setting event.target.value = '' here prevents showing the name in the native input,
    // but we use state (attachmentName) to display it anyway.
    event.target.value = "";
  };

  const handleAttachmentClick = () => {
    document.getElementById("support-attachment-input")?.click();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null); // Clear previous inline error on new submit

    if (!user || !formRef.current) {
      toast.error(!user ? "You must be logged in." : "Form error.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData(formRef.current);
    const loadingToastId = toast.loading("Sending message...");

    try {
      const result = await submitSupportRequest(formData);
      toast.dismiss(loadingToastId);

      if (result.success) {
        toast.success("Message Sent Successfully!", { duration: 2000 });
        formRef.current?.reset(); // Reset native form fields
        setAttachment(null);
        setAttachmentName(""); // Clear file state
        // Re-populate name/email based on user after reset
        if (user && formRef.current) {
          const nameInput = formRef.current.elements.namedItem(
            "name",
          ) as HTMLInputElement;
          const emailInput = formRef.current.elements.namedItem(
            "email",
          ) as HTMLInputElement;
          const fullName =
            `${user.firstName || ""} ${user.lastName || ""}`.trim();
          if (nameInput) nameInput.value = fullName || user.username || "";
          if (emailInput) emailInput.value = user.email || "";
        }
        setTimeout(() => {
          router.push("/customer/mymessages");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to send message.");
        setSubmitError(result.message || "Failed to send message."); // Set inline error state
        setIsSubmitting(false); // Stop loading on error
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error calling submitSupportRequest action:", error);
      const errorMsg = "An unexpected error occurred submitting the form.";
      toast.error(errorMsg);
      setSubmitError(errorMsg); // Set inline error state
      setIsSubmitting(false); // Stop loading on error
    }
    // Removed finally block as success path redirects, error path sets isSubmitting=false
  };

  return (
    // Use Card component for background, border, padding, shadow
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        {/* Use CardTitle, ensure text color uses theme */}
        <CardTitle className="text-2xl text-center font-semibold">
          Contact Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Form uses semantic spacing */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div className="space-y-1.5">
            {/* Use shadcn Label, automatically gets dark mode styling */}
            <Label htmlFor="title">
              Subject / Title <span className="text-destructive">*</span>
            </Label>
            {/* Use shadcn Input, automatically gets dark mode styling */}
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g., Issue with order #12345"
              disabled={!user || isSubmitting}
            />
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              disabled={!user || isSubmitting}
              // Use defaultValue for uncontrolled components populated by useEffect
              defaultValue={
                user
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    user.username ||
                    ""
                  : ""
              }
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Your Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={!user || isSubmitting}
              defaultValue={user?.email ?? ""}
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="message">
              Your Message <span className="text-destructive">*</span>
            </Label>
            {/* Use shadcn Textarea */}
            <Textarea
              id="message"
              name="message"
              rows={5}
              required
              placeholder="Please describe your issue or question in detail..."
              disabled={!user || isSubmitting}
            />
          </div>

          {/* Attachment Section */}
          <div className="space-y-1.5">
            <Label>Attachment (Optional - Max 5MB Image)</Label>
            {/* Hidden native input remains */}
            <Input
              type="file"
              id="support-attachment-input"
              name="attachment"
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!user || isSubmitting}
              aria-label="Attach an optional image file (Max 5MB)"
            />
            {/* Use shadcn Button for attach trigger */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline" // Use outline variant
                onClick={handleAttachmentClick}
                disabled={!user || isSubmitting}
              >
                <Paperclip className="mr-2 h-4 w-4" aria-hidden="true" />
                {attachmentName ? "Change File" : "Attach File"}
              </Button>
              {/* Display file name using theme text color */}
              {attachmentName && (
                <span className="text-sm text-muted-foreground truncate">
                  {attachmentName}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            {/* Use shadcn Button, primary color is default */}
            <Button
              type="submit"
              disabled={!user || isSubmitting}
              className="w-full"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>

          {/* Inline Status Message Area using Alert */}
          {submitError && (
            <Alert variant="destructive" role="alert">
              {/* Optional AlertTitle */}
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Login Prompt using Alert */}
          {!user && (
            <Alert
              variant="default"
              className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 text-center"
            >
              <AlertDescription>
                Please log in to submit a support request.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

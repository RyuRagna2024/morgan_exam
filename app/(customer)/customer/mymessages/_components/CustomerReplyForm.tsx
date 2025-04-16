// app/(customer)/customer/mymessages/_components/CustomerReplyForm.tsx

"use client";

import React, { useState, useRef, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Adjust path if needed
import { Textarea } from "@/components/ui/textarea"; // Adjust path if needed
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner"; // Or your preferred toast library
// Adjust path to the customer reply action file we will create next
import { addCustomerReply } from "@/app/(customer)/customer/mymessages/_actions/add-customer-reply";

interface CustomerReplyFormProps {
  ticketId: string; // Need the ID of the ticket to reply to
}

const CustomerReplyForm: React.FC<CustomerReplyFormProps> = ({ ticketId }) => {
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition(); // For loading state
  const formRef = useRef<HTMLFormElement>(null); // Ref to potentially reset the form

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission

    // Basic validation: Ensure message is not empty
    const trimmedReply = replyText.trim();
    if (!trimmedReply) {
      toast.error("Your reply message cannot be empty.");
      return;
    }

    // Set loading state and call server action
    startTransition(async () => {
      const loadingToastId = toast.loading("Sending reply...");
      try {
        // Call the server action (defined in Step 4)
        const result = await addCustomerReply(ticketId, trimmedReply);

        toast.dismiss(loadingToastId); // Dismiss loading toast

        if (result.success) {
          toast.success(result.message || "Reply sent successfully!");
          setReplyText(""); // Clear the textarea state on success
          // formRef.current?.reset(); // Optionally reset the form element itself
          // Data refresh should be handled by revalidatePath in the action
        } else {
          // Show specific error from server action or a default one
          toast.error(
            result.message || "Failed to send reply. Please try again.",
          );
        }
      } catch (error) {
        toast.dismiss(loadingToastId); // Dismiss loading on unexpected error
        console.error("Error sending customer reply:", error);
        toast.error("An unexpected error occurred while sending your reply.");
      }
    });
  };

  return (
    <Card className="mt-4">
      {" "}
      {/* Add some top margin */}
      {/* Using CardContent directly for padding */}
      <CardContent className="pt-6">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex items-start space-x-3"
        >
          <Textarea
            placeholder="Type your reply here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
            rows={3} // Adjust rows as needed
            className="flex-grow resize-none" // Allow textarea to take space
            disabled={isPending} // Disable textarea while submitting
            aria-label="Your reply message"
          />
          <Button
            type="submit"
            disabled={!replyText.trim() || isPending} // Disable button if text is empty or pending
            aria-disabled={!replyText.trim() || isPending}
          >
            {isPending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" /> // Use Send icon
            )}
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerReplyForm;

// app/(customer)/customer/mymessages/_components/CustomerReplyForm.tsx
"use client";

import React, { useState, useRef, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { addCustomerReply } from "@/app/(customer)/customer/mymessages/_actions/add-customer-reply"; // Adjust path

interface CustomerReplyFormProps { ticketId: string; }

const CustomerReplyForm: React.FC<CustomerReplyFormProps> = ({ ticketId }) => {
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedReply = replyText.trim();
    if (!trimmedReply) { toast.error("Reply cannot be empty."); return; }

    startTransition(async () => {
      const loadingToastId = toast.loading("Sending reply...");
      try {
        const result = await addCustomerReply(ticketId, trimmedReply);
        toast.dismiss(loadingToastId);
        if (result.success) {
          toast.success(result.message || "Reply sent!");
          setReplyText(""); // Clear textarea
          // Refresh handled by revalidatePath in action
        } else {
          toast.error(result.message || "Failed to send reply.");
        }
      } catch (error) {
        toast.dismiss(loadingToastId);
        console.error("Error sending customer reply:", error);
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    // Use Card for consistency
    <Card className="mt-6">
      <CardContent className="pt-6"> {/* Add padding top */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex items-start space-x-3">
          <Textarea
            placeholder="Type your reply here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required rows={3} className="flex-grow resize-none"
            disabled={isPending} aria-label="Your reply message"
          />
          <Button type="submit" disabled={!replyText.trim() || isPending} aria-disabled={!replyText.trim() || isPending} size="icon">
            {isPending ? ( <LoaderCircle className="h-4 w-4 animate-spin" /> ) : ( <Send className="h-4 w-4" /> )}
            <span className="sr-only">Send Reply</span> {/* Added for accessibility */}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerReplyForm;
// src/components/admin/support/ReplyForm.tsx

"use client";

import React, { useState, useRef, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Card for container
import { Textarea } from "@/components/ui/textarea"; // Shadcn Textarea
import { Button } from "@/components/ui/button"; // Shadcn Button
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
// Adjust path to where the add reply action will be created
import { addReply } from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/_actions/add-reply"; // We need to create this action

interface ReplyFormProps {
  ticketId: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ ticketId }) => {
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition(); // For loading state
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!replyText.trim()) {
      toast.error("Reply message cannot be empty.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addReply(ticketId, replyText); // Call server action

        if (result.success) {
          toast.success(result.message || "Reply sent successfully!");
          setReplyText(""); // Clear textarea on success
          // Optional: formRef.current?.reset(); // Can also reset the form ref
          // Data refresh is handled by revalidatePath in the server action
        } else {
          toast.error(result.message || "Failed to send reply.");
        }
      } catch (error) {
        console.error("Error sending reply:", error);
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <Card>
      {/* <CardHeader><CardTitle>Reply</CardTitle></CardHeader> // Optional Header */}
      <CardContent className="pt-6">
        {" "}
        {/* Add padding if no header */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex items-start space-x-3"
        >
          <Textarea
            placeholder="Type your message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
            rows={3}
            className="flex-grow resize-none" // Allow textarea to grow
            disabled={isPending} // Disable while submitting
          />
          <Button type="submit" disabled={!replyText.trim() || isPending}>
            {isPending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReplyForm;

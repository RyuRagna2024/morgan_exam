"use client";

import React, { useState, useRef, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
// Ensure correct path - creating an _actions folder is common practice
import { addReply } from "./_actions/add-reply";

interface ReplyFormProps {
  ticketId: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ ticketId }) => {
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!replyText.trim()) {
      toast.error("Reply message cannot be empty.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addReply(ticketId, replyText);
        if (result.success) {
          toast.success(result.message || "Reply sent successfully!");
          setReplyText(""); // Clear textarea
          // Refresh logic should be handled by server action revalidation
          // Or potentially router.refresh() if needed immediately client-side
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
    // *** ADDED DARK MODE STYLES ***
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="pt-6">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex items-start space-x-3"
        >
          {/* *** ADDED DARK MODE STYLES *** */}
          <Textarea
            placeholder="Type your message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
            rows={3}
            className="flex-grow resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary dark:focus:ring-offset-gray-800"
            disabled={isPending}
          />
          {/* Shadcn Button should handle dark mode, ensure variant/styling is appropriate */}
          <Button
            type="submit"
            disabled={!replyText.trim() || isPending}
            size="lg"
          >
            {" "}
            {/* Made button slightly larger */}
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

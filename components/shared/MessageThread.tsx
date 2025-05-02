// components/shared/MessageThread.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust path
import { format, formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils"; // Adjust path

// Define types locally or import from a shared types file
type MessageSender = {
  id: string;
  username: string | null;
  role: string | null;
} | null;
type MessageItem = {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: MessageSender;
};
type InitialMessage = {
  content: string;
  createdAt: Date;
  sender: { id: string; username: string | null; role: string | null } | null;
};

interface MessageThreadProps {
  initialMessage: InitialMessage;
  messages: MessageItem[];
  currentUserId: string; // ID of the currently viewing user (admin)
}

const MessageThread: React.FC<MessageThreadProps> = ({
  initialMessage,
  messages,
  currentUserId,
}) => {
  // Helper to get display name
  const getSenderName = (
    sender: MessageSender | InitialMessage["sender"],
  ): string => {
    if (!sender) return "System";
    if (sender.username) return sender.username;
    const rolePrefix =
      sender.role === "ADMIN" || sender.role === "SUPERADMIN"
        ? "Admin "
        : "User ";
    return rolePrefix + sender.id.substring(0, 6);
  };

  // Helper to get role label (You / Support)
  const getSenderRoleLabel = (
    senderId: string | null | undefined, // Pass sender ID
    senderRole: string | null | undefined, // Pass sender Role
  ): string => {
    if (!senderId) return ""; // Should not happen if sender exists
    const isAdmin = senderRole === "ADMIN" || senderRole === "SUPERADMIN";
    if (isAdmin) return " (Support)";
    if (senderId === currentUserId) return " (You)"; // Check if sender is the current viewer
    return ""; // Non-admin, not current viewer (e.g., customer name)
  };

  return (
    // *** ADDED DARK MODE STYLES ***
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* *** ADDED DARK MODE STYLES *** */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Messages
        </CardTitle>
      </CardHeader>
      {/* *** ADDED DARK MODE STYLES *** */}
      <CardContent className="pt-4 space-y-4">
        {/* Initial Message */}
        <div
          className={cn(
            "flex flex-col p-3 rounded-lg",
            // *** ADDED DARK MODE STYLES ***
            "bg-gray-100 border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600", // Neutral dark style
          )}
        >
          <div className="flex justify-between items-center mb-1">
            {/* *** ADDED DARK MODE STYLES *** */}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {getSenderName(initialMessage.sender)}
              {/* Pass ID and Role */}
              {getSenderRoleLabel(
                initialMessage.sender?.id,
                initialMessage.sender?.role,
              )}
            </span>
            {/* *** ADDED DARK MODE STYLES *** */}
            <span
              className="text-xs text-gray-500 dark:text-gray-400"
              title={format(
                new Date(initialMessage.createdAt),
                "yyyy-MM-dd HH:mm:ss",
              )}
            >
              {formatDistanceToNowStrict(new Date(initialMessage.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {/* *** ADDED DARK MODE STYLES *** */}
          <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            {initialMessage.content}
          </p>
        </div>

        {/* Replies */}
        {messages.map((message) => {
          const isCurrentUserSender = message.senderId === currentUserId;
          const senderName = getSenderName(message.sender);
          const senderRoleLabel = getSenderRoleLabel(
            message.sender?.id,
            message.sender?.role,
          );

          return (
            <div
              key={message.id}
              className={cn(
                "flex flex-col p-3 rounded-lg border w-full md:w-11/12 shadow-sm", // Added shadow
                isCurrentUserSender
                  ? // *** ADDED DARK MODE STYLES ***
                    "bg-blue-100 border-blue-200 dark:bg-blue-900/70 dark:border-blue-700 self-end" // Message sent by admin (darker blue)
                  : // *** ADDED DARK MODE STYLES ***
                    "bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600 self-start", // Message received from customer (darker gray)
              )}
            >
              <div
                className={cn(
                  "flex items-center mb-1 w-full text-xs",
                  isCurrentUserSender ? "justify-end" : "justify-start",
                )}
              >
                {/* *** Conditional rendering and dark mode styles for meta text *** */}
                {!isCurrentUserSender && (
                  <span className="font-semibold text-gray-700 dark:text-gray-200 mr-2">
                    {senderName}
                    <span className="font-normal text-gray-600 dark:text-gray-400">
                      {senderRoleLabel}
                    </span>
                  </span>
                )}
                <span
                  className="text-gray-500 dark:text-gray-400"
                  title={format(
                    new Date(message.createdAt),
                    "yyyy-MM-dd HH:mm:ss",
                  )}
                >
                  {formatDistanceToNowStrict(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {isCurrentUserSender && (
                  <span className="font-semibold text-blue-800 dark:text-blue-300 ml-2">
                    {senderName}
                    <span className="font-normal text-blue-700 dark:text-blue-400">
                      {senderRoleLabel}
                    </span>
                  </span>
                )}
              </div>
              {/* *** ADDED DARK MODE STYLES *** */}
              <p
                className={cn(
                  "text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap",
                  isCurrentUserSender ? "text-right" : "text-left",
                )}
              >
                {message.content}
              </p>
            </div>
          );
        })}

        {messages.length === 0 && (
          // *** ADDED DARK MODE STYLES ***
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 italic">
            No replies yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageThread;

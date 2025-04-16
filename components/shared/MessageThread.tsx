// @app/components/shared/MessageThread.tsx (Moved from admin folder)

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
  // Add other message fields if needed
};
type InitialMessage = {
  content: string;
  createdAt: Date;
  sender: { id: string; username: string | null; role: string | null } | null;
};

interface MessageThreadProps {
  initialMessage: InitialMessage;
  messages: MessageItem[];
  currentUserId: string; // ID of the currently viewing user (admin or customer)
}

const MessageThread: React.FC<MessageThreadProps> = ({
  initialMessage,
  messages,
  currentUserId,
}) => {
  const getSenderName = (
    sender: MessageSender | InitialMessage["sender"],
  ): string => {
    if (!sender) return "System";
    // Prioritize username, fallback to role + ID substring
    if (sender.username) return sender.username;
    const rolePrefix =
      sender.role === "ADMIN" || sender.role === "SUPERADMIN"
        ? "Admin "
        : "User ";
    return rolePrefix + sender.id.substring(0, 6);
  };

  const getSenderRoleLabel = (
    sender: MessageSender | InitialMessage["sender"],
  ): string => {
    if (!sender || !sender.role) return "";
    if (sender.role === "ADMIN" || sender.role === "SUPERADMIN")
      return " (Support)";
    return " (You)"; // Assuming non-admin sender is the current user viewing
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 rounded-t-lg border-b">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Initial Message */}
        <div
          className={cn(
            "flex flex-col p-3 rounded-lg",
            "bg-gray-100 border border-gray-200", // Neutral style for initial message
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-700">
              {getSenderName(initialMessage.sender)}{" "}
              {getSenderRoleLabel(initialMessage.sender)}
            </span>
            <span
              className="text-xs text-gray-500"
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
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {initialMessage.content}
          </p>
        </div>

        {/* Replies */}
        {messages.map((message) => {
          // Determine if the sender of *this* message is the person currently viewing
          const isCurrentUserSender = message.senderId === currentUserId;
          // Determine if sender is admin based on role from DB
          const isAdminSender =
            message.sender?.role === "ADMIN" ||
            message.sender?.role === "SUPERADMIN";

          const senderName = getSenderName(message.sender);
          const senderRoleLabel = isAdminSender
            ? " (Support)"
            : isCurrentUserSender
              ? " (You)"
              : "";

          return (
            <div
              key={message.id}
              className={cn(
                "flex flex-col p-3 rounded-lg border w-full md:w-11/12", // Max width slightly less than full
                isCurrentUserSender
                  ? "bg-blue-50 border-blue-200 self-end" // Message sent by viewer (blue, right)
                  : "bg-yellow-50 border-yellow-200 self-start", // Message received (yellow, left)
              )}
            >
              <div
                className={cn(
                  "flex items-center mb-1 w-full text-xs", // Smaller header text
                  isCurrentUserSender ? "justify-end" : "justify-start", // Align header
                )}
              >
                {!isCurrentUserSender && ( // Show sender first if not current user
                  <span className="font-semibold text-gray-700 mr-2">
                    {senderName}
                    {senderRoleLabel}
                  </span>
                )}
                <span
                  className="text-gray-500"
                  title={format(
                    new Date(message.createdAt),
                    "yyyy-MM-dd HH:mm:ss",
                  )}
                >
                  {formatDistanceToNowStrict(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {isCurrentUserSender && ( // Show sender last if current user
                  <span className="font-semibold text-blue-800 ml-2">
                    {senderName}
                    {senderRoleLabel}
                  </span>
                )}
              </div>
              {/* Align text based on sender */}
              <p
                className={cn(
                  "text-sm text-gray-800 whitespace-pre-wrap",
                  isCurrentUserSender ? "text-right" : "text-left",
                )}
              >
                {message.content}
              </p>
            </div>
          );
        })}

        {messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4 italic">
            No replies yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageThread;

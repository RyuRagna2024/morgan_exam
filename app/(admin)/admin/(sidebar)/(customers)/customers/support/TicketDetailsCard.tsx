import React from "react";
// Ensure path is correct, especially if page.tsx moved or route groups changed
import { FullTicketDetails } from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/[ticketId]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge"; // Ensure this handles dark mode

interface TicketDetailsCardProps {
  ticket: FullTicketDetails;
}

const TicketDetailsCard: React.FC<TicketDetailsCardProps> = ({ ticket }) => {
  if (!ticket) return null;

  return (
    // *** ADDED DARK MODE STYLES ***
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* *** ADDED DARK MODE STYLES *** */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Ticket #{ticket.id.substring(0, 8)}... Details
        </CardTitle>
      </CardHeader>
      {/* *** ADDED DARK MODE STYLES *** */}
      <CardContent className="pt-6 text-sm text-gray-900 dark:text-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {/* Apply dark styles to labels and values */}
          <div className="font-medium text-gray-500 dark:text-gray-400">
            Title
          </div>
          <div>{ticket.title}</div>

          <div className="font-medium text-gray-500 dark:text-gray-400">
            Reported By
          </div>
          <div>
            {ticket.creator?.username ?? "N/A"} (
            <span className="text-gray-600 dark:text-gray-300">
              {ticket.creator?.email ?? "N/A"}
            </span>
            )
          </div>

          <div className="font-medium text-gray-500 dark:text-gray-400">
            Status
          </div>
          <div>
            <StatusBadge status={ticket.status} />{" "}
            {/* Badge handles dark mode */}
          </div>

          <div className="font-medium text-gray-500 dark:text-gray-400">
            Created
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {format(new Date(ticket.createdAt), "PPp")}
          </div>

          <div className="font-medium text-gray-500 dark:text-gray-400">
            Last Updated
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {format(new Date(ticket.updatedAt), "PPp")}
          </div>

          <div className="font-medium text-gray-500 dark:text-gray-400 md:col-span-1">
            Description
          </div>
          {/* *** ADDED DARK MODE STYLES *** */}
          <div className="md:col-span-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/30 p-3 rounded border border-gray-200 dark:border-gray-600">
            {ticket.message}
          </div>

          {ticket.attachmentUrl && (
            <>
              <div className="font-medium text-gray-500 dark:text-gray-400">
                Attachment
              </div>
              <div>
                <a
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  View Attachment
                </a>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketDetailsCard;

// app/(customer)/customer/mymessages/_components/CustomerTicketDetailsCard.tsx

import React from "react";
// *** Adjust this import path to your customer dynamic page ***
import { FullCustomerTicketDetails } from "@/app/(customer)/customer/mymessages/[ticketId]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust path if needed
import { format } from "date-fns";
// *** Adjust this import path to your shared StatusBadge component ***
import { StatusBadge } from "@/components/shared/StatusBadge";

interface CustomerTicketDetailsCardProps {
  // Use the type exported from the customer's detail page
  ticket: FullCustomerTicketDetails;
}

const CustomerTicketDetailsCard: React.FC<CustomerTicketDetailsCardProps> = ({
  ticket,
}) => {
  // Basic check in case the ticket prop is unexpectedly null/undefined
  if (!ticket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ticket details could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 rounded-t-lg border-b">
        {/* Display truncated ID */}
        <CardTitle className="text-lg font-semibold text-gray-700">
          Ticket #{ticket.id.substring(0, 8)}... Details
        </CardTitle>
        {/* Optional: Add collapse/expand icon/button here */}
      </CardHeader>
      <CardContent className="pt-6 text-sm">
        {/* Grid layout for details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {/* Subject */}
          <div className="font-medium text-gray-500">Subject / Title</div>
          <div>{ticket.title}</div>

          {/* Status */}
          <div className="font-medium text-gray-500">Status</div>
          <div>
            {/* Use the shared StatusBadge component */}
            <StatusBadge status={ticket.status} />
          </div>

          {/* Date Created */}
          <div className="font-medium text-gray-500">Date Created</div>
          <div>{format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm:ss")}</div>

          {/* Last Updated */}
          <div className="font-medium text-gray-500">Last Updated</div>
          <div>{format(new Date(ticket.updatedAt), "yyyy-MM-dd HH:mm:ss")}</div>

          {/* Initial Message */}
          <div className="font-medium text-gray-500 md:col-span-1">
            Your Initial Message
          </div>
          <div className="md:col-span-2 text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border">
            {ticket.message}{" "}
            {/* Display the initial message stored on the ticket */}
          </div>

          {/* Attachment Link (if provided initially) */}
          {ticket.attachmentUrl && (
            <>
              <div className="font-medium text-gray-500">Your Attachment</div>
              <div>
                <a
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
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

export default CustomerTicketDetailsCard;

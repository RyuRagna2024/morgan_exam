// src/components/admin/support/TicketDetailsCard.tsx

import React from "react";
import { FullTicketDetails } from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/[ticketId]/page"; // Adjust path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Adjust path
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge";
// *** CORRECTED IMPORT ***

interface TicketDetailsCardProps {
  ticket: FullTicketDetails;
}

const TicketDetailsCard: React.FC<TicketDetailsCardProps> = ({ ticket }) => {
  if (!ticket) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 rounded-t-lg border-b">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Ticket #{ticket.id.substring(0, 8)}... Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {/* ... other details ... */}
          <div className="font-medium text-gray-500">Title</div>
          <div>{ticket.title}</div>
          <div className="font-medium text-gray-500">Reported By</div>
          <div>
            {ticket.creator?.username ?? "N/A"} (
            {ticket.creator?.email ?? "N/A"})
          </div>

          <div className="font-medium text-gray-500">Status</div>
          <div>
            {/* Use the imported StatusBadge */}
            <StatusBadge status={ticket.status} />
          </div>

          {/* ... created, updated, description, attachment ... */}
          <div className="font-medium text-gray-500">Created</div>
          <div>{format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm:ss")}</div>
          <div className="font-medium text-gray-500">Last Updated</div>
          <div>{format(new Date(ticket.updatedAt), "yyyy-MM-dd HH:mm:ss")}</div>
          <div className="font-medium text-gray-500 md:col-span-1">
            Description
          </div>
          <div className="md:col-span-2 text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border">
            {ticket.message}
          </div>
          {ticket.attachmentUrl && (
            <>
              {" "}
              <div className="font-medium text-gray-500">Attachment</div>{" "}
              <div>
                {" "}
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

export default TicketDetailsCard;

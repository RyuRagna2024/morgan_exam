// app/(customer)/customer/mymessages/_components/CustomerTicketDetailsCard.tsx

import React from "react";
// Import the precise type from the detail page
import { FullCustomerTicketDetails } from "@/app/(customer)/customer/mymessages/[ticketId]/page"; // Adjust path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/StatusBadge"; // Adjust path
import { Button } from "@/components/ui/button"; // <<< IMPORT BUTTON
import Link from "next/link"; // <<< IMPORT LINK

interface CustomerTicketDetailsCardProps {
  ticket: FullCustomerTicketDetails;
}

const CustomerTicketDetailsCard: React.FC<CustomerTicketDetailsCardProps> = ({
  ticket,
}) => {
  if (!ticket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ticket details could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50 dark:bg-muted/30 border-b">
        <CardTitle className="text-lg font-semibold">
          Ticket #{ticket.id.substring(0, 8)}... Details
        </CardTitle>
        <StatusBadge status={ticket.status} />
      </CardHeader>
      <CardContent className="pt-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Subject */}
          <div>
            <p className="font-medium text-muted-foreground mb-1">
              Subject / Title
            </p>
            <p className="text-foreground">{ticket.title}</p>
          </div>
          {/* Date Created */}
          <div>
            <p className="font-medium text-muted-foreground mb-1">
              Date Created
            </p>
            <p className="text-foreground">
              {format(new Date(ticket.createdAt), "PPPp")}
            </p>
          </div>
          {/* Last Updated */}
          <div>
            <p className="font-medium text-muted-foreground mb-1">
              Last Updated
            </p>
            <p className="text-foreground">
              {format(new Date(ticket.updatedAt), "PPPp")}
            </p>
          </div>
          {/* Spacer */}
          <div></div>
          {/* Initial Message */}
          <div className="md:col-span-2 mt-2">
            <p className="font-medium text-muted-foreground mb-1">
              Your Initial Message
            </p>
            <div className="text-foreground whitespace-pre-wrap bg-muted/50 dark:bg-muted/30 p-3 rounded border border-border">
              {ticket.message}
            </div>
          </div>
          {/* Attachment Link */}
          {ticket.attachmentUrl && (
            <div className="md:col-span-2">
              <p className="font-medium text-muted-foreground mb-1">
                Your Attachment
              </p>
              {/* Use Button with asChild and Link */}
              <Button asChild variant="link" className="p-0 h-auto text-sm">
                <Link
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Attachment
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerTicketDetailsCard;

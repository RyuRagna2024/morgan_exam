// components/shared/StatusBadge.tsx

import React from "react";
import { TicketStatus } from "@prisma/client";
import { cn } from "@/lib/utils"; // Assuming you use cn from lib

interface StatusBadgeProps {
  status: TicketStatus;
}

// Export the component
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const baseClasses =
    "px-2 py-0.5 rounded-full text-xs font-medium inline-block capitalize";
  let colorClasses = "";

  switch (status) {
    case TicketStatus.OPEN:
      colorClasses = "bg-green-100 text-green-700";
      break;
    case TicketStatus.IN_PROGRESS:
      colorClasses = "bg-yellow-100 text-yellow-700";
      break;
    case TicketStatus.CLOSED:
    case TicketStatus.RESOLVED:
      colorClasses = "bg-gray-100 text-gray-600";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-600";
      break;
  }
  // Format status: IN_PROGRESS -> in progress
  const formattedStatus = status.replace("_", " ").toLowerCase();

  return (
    // Use cn() to merge classes if needed, otherwise template literal is fine
    <span className={cn(baseClasses, colorClasses)}>{formattedStatus}</span>
  );
};

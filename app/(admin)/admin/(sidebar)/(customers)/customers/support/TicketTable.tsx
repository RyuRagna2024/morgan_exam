// src/components/admin/support/TicketTable.tsx

"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
// Corrected import path including route groups
import { TicketWithDetails } from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/page";
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  MoreHorizontal,
  MessageSquareReply,
  CheckCircle,
  LoaderCircle,
  XCircle,
  Trash2, // Keep Trash2 if you might add delete later
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path if needed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Adjust path if needed
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// Corrected import path including route groups and _actions
import { updateTicketStatus } from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/update-ticket-status";

// --- Helper: Status Badge Component ---
export const StatusBadge = ({
  status,
}: {
  status: TicketStatus;
}): JSX.Element => {
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
  const formattedStatus = status.replace("_", " ").toLowerCase();
  return (
    <span className={`${baseClasses} ${colorClasses}`}>{formattedStatus}</span>
  );
};

// --- Main Table Component ---
interface TicketTableProps {
  tickets: TicketWithDetails[];
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets }) => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  // --- Memoized Logic ---
  const filteredTickets = useMemo((): TicketWithDetails[] => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!Array.isArray(tickets)) return [];
    if (!lowerSearchTerm) return tickets;
    return tickets.filter(
      (ticket) =>
        (ticket.title?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket.creator?.username?.toLowerCase() ?? "").includes(
          lowerSearchTerm,
        ) ||
        (ticket.creator?.email?.toLowerCase() ?? "").includes(
          lowerSearchTerm,
        ) ||
        (ticket.id?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket.status?.toLowerCase().replace("_", " ") ?? "").includes(
          lowerSearchTerm,
        ),
    );
  }, [tickets, searchTerm]);

  const paginatedTickets = useMemo((): TicketWithDetails[] => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    if (!Array.isArray(filteredTickets)) return [];
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage, entriesPerPage]);

  // Calculate total pages and entry range (ensure calculated before handlers use totalPages)
  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);
  const startEntry =
    filteredTickets.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(
    currentPage * entriesPerPage,
    filteredTickets.length,
  );

  // --- Event Handlers (Lines ~76-81 area) ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleEntriesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    // Ensure totalPages is calculated correctly before this is called
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // --- Action Handlers ---
  const handleSetStatus = (ticketId: string, status: TicketStatus) => {
    setUpdatingTicketId(ticketId);
    startTransition(async () => {
      const result = await updateTicketStatus(ticketId, status);
      if (result.success) {
        toast.success(result.message || "Status updated successfully!");
      } else {
        toast.error(result.message || "Failed to update status.");
      }
      setUpdatingTicketId(null);
    });
  };

  // Placeholder for delete if you add it back later
  // const handleDelete = (ticketId: string) => { /* ... */ };

  // --- JSX Rendering ---
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 gap-4">
        {/* Entries Dropdown */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="entries"
            className="text-sm text-gray-600 whitespace-nowrap"
          >
            Show
          </label>
          <select
            id="entries"
            name="entries"
            value={entriesPerPage}
            onChange={handleEntriesChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <label htmlFor="search" className="text-sm text-gray-600">
            Search:
          </label>
          <input
            type="search"
            id="search"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>{" "}
      {/* End Header Div */}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Headers */}
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Id
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Reported by
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                All Messages
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Message
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Rows */}
            {Array.isArray(paginatedTickets) && paginatedTickets.length > 0 ? (
              // Explicitly type 'ticket' here
              paginatedTickets.map((ticket: TicketWithDetails) => {
                const isCurrentTicketUpdating =
                  updatingTicketId === ticket.id && isPending;
                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${isCurrentTicketUpdating ? "opacity-70" : ""}`}
                  >
                    {/* Cells */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                        #{ticket.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {ticket.creator?.username ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {format(
                        new Date(ticket.createdAt),
                        "yyyy-MM-dd HH:mm:ss",
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                      {(ticket._count?.messages ?? 0) > 0
                        ? ticket._count.messages
                        : "Initial"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {ticket.messages?.[0]?.createdAt
                        ? formatDistanceToNowStrict(
                            new Date(ticket.messages[0].createdAt),
                            { addSuffix: true },
                          )
                        : "No Replies"}
                    </td>
                    {/* Actions Cell */}
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          disabled={isCurrentTicketUpdating || isPending}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ticket ${ticket.id.substring(0, 8)}`}
                          >
                            {isCurrentTicketUpdating ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/customers/support/${ticket.id}`}
                              className="flex items-center cursor-pointer"
                            >
                              <MessageSquareReply className="mr-2 h-4 w-4" />
                              <span>Reply</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleSetStatus(ticket.id, TicketStatus.OPEN)
                            }
                            disabled={
                              ticket.status === TicketStatus.OPEN || isPending
                            }
                            className="flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            <span>Set Status to Open</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleSetStatus(
                                ticket.id,
                                TicketStatus.IN_PROGRESS,
                              )
                            }
                            disabled={
                              ticket.status === TicketStatus.IN_PROGRESS ||
                              isPending
                            }
                            className="flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <LoaderCircle className="mr-2 h-4 w-4 text-yellow-600" />
                            <span>Set Status to In Progress</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleSetStatus(ticket.id, TicketStatus.CLOSED)
                            }
                            disabled={
                              ticket.status === TicketStatus.CLOSED ||
                              ticket.status === TicketStatus.RESOLVED ||
                              isPending
                            }
                            className="flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                            <span>Set Status to Closed</span>
                          </DropdownMenuItem>
                          {/* Removed Delete item */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ); // End return map
              }) // End map
            ) : (
              // No tickets row
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  {" "}
                  No tickets found{searchTerm ? " matching your search" : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>{" "}
      {/* End Table container */}
      {/* Footer Section */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 gap-4">
        {/* Showing info */}
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {filteredTickets.length} entries
        </div>
        {/* Pagination */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Previous
          </button>
          <span className="px-3 py-1 border border-blue-500 bg-blue-500 text-white rounded-md text-sm font-medium">
            {currentPage}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Next
          </button>
        </div>
      </div>{" "}
      {/* End Footer */}
    </div> // End Main Container div
  ); // End Component Return
}; // End Component Definition

export default TicketTable;

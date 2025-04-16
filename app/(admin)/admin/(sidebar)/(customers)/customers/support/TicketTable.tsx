// src/components/admin/support/TicketTable.tsx

"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
// Ensure this import path is correct, including route groups
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  MoreHorizontal,
  MessageSquareReply,
  CheckCircle,
  LoaderCircle,
  XCircle,
  Trash2,
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
// Ensure this import path is correct (relative or alias)
// Ensure this import path is correct
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TicketWithDetails } from "./page";
import { updateTicketStatus } from "./update-ticket-status";

// --- Main Table Component ---
interface TicketTableProps {
  tickets: TicketWithDetails[]; // Using the imported type
}

// Explicitly type the component with React.FC
export const TicketTable: React.FC<TicketTableProps> = ({ tickets }) => {
  // --- Hooks ---
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  // --- Memoized Logic with Explicit Return Types ---
  const filteredTickets = useMemo((): TicketWithDetails[] => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Safety check: Ensure 'tickets' is actually an array before filtering
    if (!Array.isArray(tickets)) {
      console.warn("TicketTable: 'tickets' prop is not an array.");
      return []; // Must return the declared type (empty array is valid)
    }
    if (!lowerSearchTerm) {
      return tickets; // Return the original array if no search term
    }
    // Filter logic with optional chaining for safety
    const results = tickets.filter(
      (ticket) =>
        (ticket?.title?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.creator?.username?.toLowerCase() ?? "").includes(
          lowerSearchTerm,
        ) ||
        (ticket?.creator?.email?.toLowerCase() ?? "").includes(
          lowerSearchTerm,
        ) ||
        (ticket?.id?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.status?.toLowerCase().replace("_", " ") ?? "").includes(
          lowerSearchTerm,
        ),
    );
    return results; // Return the filtered array
  }, [tickets, searchTerm]); // Dependencies

  const paginatedTickets = useMemo((): TicketWithDetails[] => {
    // Safety check: Ensure 'filteredTickets' is an array
    if (!Array.isArray(filteredTickets)) {
      console.warn("TicketTable: 'filteredTickets' is not an array.");
      return []; // Must return the declared type
    }
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const results = filteredTickets.slice(startIndex, endIndex);
    return results; // Return the sliced array
  }, [filteredTickets, currentPage, entriesPerPage]); // Dependencies

  // --- Calculations (Derived State) ---
  const totalFilteredTickets = Array.isArray(filteredTickets)
    ? filteredTickets.length
    : 0;
  const totalPages = Math.ceil(totalFilteredTickets / entriesPerPage);
  const startEntry =
    totalFilteredTickets > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * entriesPerPage, totalFilteredTickets);

  // --- Event Handlers ---
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

  // Row click handler
  const handleRowClick = (ticketId: string) => {
    router.push(`/admin/customers/support/${ticketId}`);
  };

  // --- JSX Rendering ---
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 gap-4">
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
      {/* End Header */}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
            {/* Check if array before mapping */}
            {Array.isArray(paginatedTickets) && paginatedTickets.length > 0 ? (
              // Add explicit type to map parameter
              paginatedTickets.map((ticket: TicketWithDetails) => {
                const isCurrentTicketUpdating =
                  updatingTicketId === ticket.id && isPending;
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => handleRowClick(ticket.id)} // Row click handler
                    className={`hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${isCurrentTicketUpdating ? "opacity-70" : ""}`}
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
                    {/* Actions Cell with stopPropagation */}
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <div onClick={(e) => e.stopPropagation()}>
                        {" "}
                        {/* Prevent row click */}
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>{" "}
                      {/* End stopPropagation wrapper */}
                    </td>
                  </tr> // Ensure tr is closed
                ); // Ensure map return parenthesis is closed
              }) // Ensure map closing parenthesis is closed
            ) : (
              // Ternary else case
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  {" "}
                  No tickets found{searchTerm ? " matching your search" : ""}.
                </td>
              </tr>
            )}{" "}
            {/* Ensure ternary closing brace is closed */}
          </tbody>{" "}
          {/* Ensure tbody is closed */}
        </table>{" "}
        {/* Ensure table is closed */}
      </div>{" "}
      {/* End overflow div */}
      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 gap-4">
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {totalFilteredTickets} entries
        </div>
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
      {/* End footer div */}
    </div> // End main component div
  ); // End component return
}; // End component definition

export default TicketTable;

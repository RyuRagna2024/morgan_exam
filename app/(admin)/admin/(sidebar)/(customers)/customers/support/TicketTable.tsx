// src/components/admin/support/TicketTable.tsx

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Assuming Shadcn Dropdown path
import { TicketWithDetails } from "./page";

// --- Helper: Status Badge Component --- (Keep as is)
const StatusBadge = ({ status }: { status: TicketStatus }) => {
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
  }
  const formattedStatus = status.replace("_", " ").toLowerCase();
  return (
    <span className={`${baseClasses} ${colorClasses}`}>{formattedStatus}</span>
  );
};

// --- Main Table Component ---
interface TicketTableProps {
  tickets: TicketWithDetails[]; // Prop type using the imported type
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Memoized filtering logic with explicit return type
  const filteredTickets = useMemo((): TicketWithDetails[] => {
    // <-- Add explicit return type
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Add safety check for initial state or errors
    if (!Array.isArray(tickets)) return [];
    if (!lowerSearchTerm) return tickets;
    return tickets.filter(
      (ticket) =>
        // Add nullish coalescing for safety
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
    // Keep dependencies - ESLint warning might resolve after fixing types
  }, [tickets, searchTerm]);

  // Memoized pagination logic with explicit return type
  const paginatedTickets = useMemo((): TicketWithDetails[] => {
    // <-- Add explicit return type
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    // Add safety check
    if (!Array.isArray(filteredTickets)) return [];
    return filteredTickets.slice(startIndex, endIndex);
    // Keep dependencies
  }, [filteredTickets, currentPage, entriesPerPage]);

  // Calculate total pages - error should resolve now
  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);
  const startEntry =
    filteredTickets.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(
    currentPage * entriesPerPage,
    filteredTickets.length,
  );

  // Handlers (remain the same)
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

  // Placeholder Action Handlers (remain the same)
  const handleSetStatus = (ticketId: string, status: TicketStatus) => {
    alert(
      `Action: Set status for ticket ${ticketId.substring(0, 8)} to ${status}`,
    );
  };
  const handleDelete = (ticketId: string) => {
    if (confirm(`Delete ticket ${ticketId.substring(0, 8)}?`)) {
      alert(`Action: Delete ticket ${ticketId.substring(0, 8)}`);
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 gap-4">
        {/* ... entries dropdown ... */}
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
        {/* ... search input ... */}
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Headers remain the same */}
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
            {/* Add safety check */}
            {Array.isArray(paginatedTickets) && paginatedTickets.length > 0 ? (
              // Explicitly type 'ticket' here
              paginatedTickets.map(
                (
                  ticket: TicketWithDetails, // <-- Add type here
                ) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Cells - Add optional chaining ?. where appropriate */}
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
                    </td>{" "}
                    {/* Added ?. */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {format(
                        new Date(ticket.createdAt),
                        "yyyy-MM-dd HH:mm:ss",
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                      {(ticket._count?.messages ?? 0) > 0
                        ? ticket._count.messages
                        : "Initial"}{" "}
                      {/* Added ?. */}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {ticket.messages?.[0]?.createdAt // Access with ?.
                        ? formatDistanceToNowStrict(
                            new Date(ticket.messages[0].createdAt),
                            { addSuffix: true },
                          )
                        : "No Replies"}
                    </td>
                    {/* Actions Column */}
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      {/* Dropdown Menu structure remains */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ticket ${ticket.id.substring(0, 8)}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
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
                            disabled={ticket.status === TicketStatus.OPEN}
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
                              ticket.status === TicketStatus.IN_PROGRESS
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
                              ticket.status === TicketStatus.RESOLVED
                            }
                            className="flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                            <span>Set Status to Closed</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(ticket.id)}
                            className="flex items-center cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ),
              ) // End map
            ) : (
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
      </div>

      {/* Footer Section */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 gap-4">
        {/* ... showing info ... */}
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {filteredTickets.length} entries
        </div>
        {/* ... pagination controls ... */}
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
      </div>
    </div>
  );
};

export default TicketTable;

"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  MoreHorizontal,
  MessageSquareReply,
  CheckCircle,
  LoaderCircle,
  XCircle,
  Search, // Added Search Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge"; // Ensure this handles dark mode
import { TicketWithDetails } from "./page";
import { updateTicketStatus } from "./update-ticket-status"; // Ensure correct path

interface TicketTableProps {
  tickets: TicketWithDetails[];
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  // Memoized Logic - No changes needed here
  const filteredTickets = useMemo((): TicketWithDetails[] => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!Array.isArray(tickets)) return [];
    if (!lowerSearchTerm) return tickets;
    return tickets.filter(
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
  }, [tickets, searchTerm]);

  const paginatedTickets = useMemo((): TicketWithDetails[] => {
    if (!Array.isArray(filteredTickets)) return [];
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage, entriesPerPage]);

  // Calculations - No changes needed here
  const totalFilteredTickets = Array.isArray(filteredTickets)
    ? filteredTickets.length
    : 0;
  const totalPages = Math.ceil(totalFilteredTickets / entriesPerPage);
  const startEntry =
    totalFilteredTickets > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * entriesPerPage, totalFilteredTickets);

  // Event Handlers - No changes needed here
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

  // Action Handlers - No changes needed here
  const handleSetStatus = (ticketId: string, status: TicketStatus) => {
    setUpdatingTicketId(ticketId);
    startTransition(async () => {
      const result = await updateTicketStatus(ticketId, status);
      if (result.success) {
        toast.success(result.message || "Status updated successfully!");
        // Consider using router.refresh() if updateTicketStatus uses revalidatePath
      } else {
        toast.error(result.message || "Failed to update status.");
      }
      setUpdatingTicketId(null);
    });
  };
  const handleRowClick = (ticketId: string) => {
    router.push(`/admin/customers/support/${ticketId}`);
  };

  return (
    // *** ADDED DARK MODE STYLES ***
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      {/* *** ADDED DARK MODE STYLES *** */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="entries"
            className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
          >
            Show
          </label>
          <select
            id="entries"
            name="entries"
            value={entriesPerPage}
            onChange={handleEntriesChange}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            entries
          </span>
        </div>
        <div className="relative flex-grow sm:flex-grow-0">
          {/* <label htmlFor="search" className="text-sm text-gray-600 dark:text-gray-400">Search:</label> */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="search"
            id="search"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="pl-9 pr-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Table */}
      {/* *** ADDED DARK MODE STYLES *** */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Id
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Reported by
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                All Messages
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Last Message
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          {/* *** ADDED DARK MODE STYLES *** */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.isArray(paginatedTickets) && paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket: TicketWithDetails) => {
                const isCurrentTicketUpdating =
                  updatingTicketId === ticket.id && isPending;
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => handleRowClick(ticket.id)}
                    className={`hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-150 ${isCurrentTicketUpdating ? "opacity-70 pointer-events-none" : ""}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block">
                        #{ticket.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-100">
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {/* StatusBadge handles dark mode */}
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {ticket.creator?.username ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(ticket.createdAt), "PPp")}{" "}
                      {/* Locale Date & Time */}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                      {(ticket._count?.messages ?? 0) > 0
                        ? ticket._count.messages
                        : "Initial"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {ticket.messages?.[0]?.createdAt
                        ? formatDistanceToNowStrict(
                            new Date(ticket.messages[0].createdAt),
                            { addSuffix: true },
                          )
                        : "No Replies"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <div onClick={(e) => e.stopPropagation()}>
                        {/* DropdownMenu (Shadcn) should handle dark mode reasonably */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild disabled={isPending}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              aria-label={`Actions for ticket ${ticket.id.substring(0, 8)}`}
                            >
                              {isCurrentTicketUpdating ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          {/* DropdownMenuContent should adapt */}
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/customers/support/${ticket.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                <MessageSquareReply className="mr-2 h-4 w-4" />
                                <span>Reply / View Details</span>
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
                              <span>Set Open</span>
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
                              <LoaderCircle className="mr-2 h-4 w-4 text-yellow-500" />
                              <span>Set In Progress</span>
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
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              <span>Set Closed</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleSetStatus(
                                  ticket.id,
                                  TicketStatus.RESOLVED,
                                )
                              }
                              disabled={
                                ticket.status === TicketStatus.RESOLVED ||
                                isPending
                              }
                              className="flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                              <span>Set Resolved</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No tickets found{searchTerm ? " matching your search" : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {/* *** ADDED DARK MODE STYLES *** */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startEntry} to {endEntry} of {totalFilteredTickets} entries
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {/* Consider a more advanced pagination component if needed */}
            <span className="px-3 py-1 border border-primary bg-primary text-primary-foreground rounded-md text-sm font-medium">
              {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketTable;

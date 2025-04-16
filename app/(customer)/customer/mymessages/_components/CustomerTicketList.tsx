// app/(customer)/customer/mymessages/_components/CustomerTicketList.tsx

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
// Ensure this import path is correct and page.tsx exports the type
import { TicketWithDetails } from "@/app/(customer)/customer/mymessages/page";
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path
import { StatusBadge } from "@/components/shared/StatusBadge"; // Adjust path

interface CustomerTicketListProps {
  tickets: TicketWithDetails[];
}

export const CustomerTicketList: React.FC<CustomerTicketListProps> = ({
  tickets,
}) => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // --- Memoized Logic ---
  const filteredTickets = useMemo((): TicketWithDetails[] => {
    // Explicit Return Type
    // Safety check for input array
    if (!Array.isArray(tickets)) {
      console.warn("CustomerTicketList: 'tickets' prop is not an array.");
      return []; // MUST return an array matching the declared return type
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) {
      return tickets; // Return original array if no search term
    }
    // Perform filtering
    const results = tickets.filter(
      (ticket) =>
        (ticket?.title?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.id?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.status?.toLowerCase().replace("_", " ") ?? "").includes(
          lowerSearchTerm,
        ),
    );
    return results; // Return the filtered array
  }, [tickets, searchTerm]); // Dependencies are correct

  const paginatedTickets = useMemo((): TicketWithDetails[] => {
    // Explicit Return Type
    // Safety check for input array
    if (!Array.isArray(filteredTickets)) {
      console.warn("CustomerTicketList: 'filteredTickets' is not an array.");
      return []; // MUST return an array matching the declared return type
    }
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const results = filteredTickets.slice(startIndex, endIndex);
    return results; // Return the sliced array
  }, [filteredTickets, currentPage, entriesPerPage]); // Dependencies are correct

  // --- Calculations ---
  // Use safety check for length property
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
            placeholder="Search messages..."
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Subject / Title
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
                Date Created
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Messages
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Update
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
            {Array.isArray(paginatedTickets) && paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket: TicketWithDetails) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    {ticket.title}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                    {(ticket._count?.messages ?? 0) + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {ticket.messages?.[0]?.createdAt
                      ? formatDistanceToNowStrict(
                          new Date(ticket.messages[0].createdAt),
                          { addSuffix: true },
                        )
                      : formatDistanceToNowStrict(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <Link href={`/customer/mymessages/${ticket.id}`} passHref>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`View ticket ${ticket.title}`}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  You haven&apos;t submitted any support messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
      </div>
    </div>
  );
};

export default CustomerTicketList;

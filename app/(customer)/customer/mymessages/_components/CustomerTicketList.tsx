// app/(customer)/customer/mymessages/_components/CustomerTicketList.tsx

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
// Ensure this path points correctly to your mymessages page
import { TicketWithDetails } from "@/app/(customer)/customer/mymessages/page"; // Adjust if needed
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Eye } from "lucide-react"; // Import Eye icon
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { StatusBadge } from "@/components/shared/StatusBadge"; // Adjust path

interface CustomerTicketListProps {
  tickets: TicketWithDetails[];
}

export const CustomerTicketList: React.FC<CustomerTicketListProps> = ({
  tickets,
}) => {
  // ... (state, useMemo, handlers remain the same) ...
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const filteredTickets = useMemo((): TicketWithDetails[] => {
    /* ... */
  }, [tickets, searchTerm]);
  const paginatedTickets = useMemo((): TicketWithDetails[] => {
    /* ... */
  }, [filteredTickets, currentPage, entriesPerPage]);
  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);
  const startEntry =
    filteredTickets.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(
    currentPage * entriesPerPage,
    filteredTickets.length,
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleEntriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      {/* ... Header ... */}
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
                  {/* === ACTION CELL UPDATED === */}
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <Link href={`/customer/mymessages/${ticket.id}`} passHref>
                      {/* Use Button component for styling */}
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
                  {/* === END ACTION CELL === */}
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
      {/* ... Footer ... */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 gap-4">
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {filteredTickets.length} entries
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

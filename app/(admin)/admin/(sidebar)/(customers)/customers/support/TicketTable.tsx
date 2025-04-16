// src/components/admin/support/TicketTable.tsx

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { TicketWithDetails } from "./page";

// --- Helper: Status Badge Component ---
const StatusBadge = ({ status }: { status: TicketStatus }) => {
  // Combined base and specific classes for readability
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
      colorClasses = "bg-gray-100 text-gray-600"; // Group visually
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-600";
  }
  // Format status: IN_PROGRESS -> in progress
  const formattedStatus = status.replace("_", " ").toLowerCase();

  // Return the span with combined classes
  return (
    <span className={`${baseClasses} ${colorClasses}`}>{formattedStatus}</span>
  );
};

// --- Main Table Component ---
interface TicketTableProps {
  tickets: TicketWithDetails[]; // Use the imported type
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets }) => {
  // State hooks for interactivity
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Memoized filtering logic
  const filteredTickets = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) return tickets; // No search term, return all
    // Filter based on multiple fields
    return tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(lowerSearchTerm) ||
        ticket.creator.username.toLowerCase().includes(lowerSearchTerm) ||
        ticket.creator.email.toLowerCase().includes(lowerSearchTerm) ||
        ticket.id.toLowerCase().includes(lowerSearchTerm) ||
        ticket.status.toLowerCase().replace("_", " ").includes(lowerSearchTerm), // Allow searching by status text
    );
  }, [tickets, searchTerm]); // Dependencies: re-filter if tickets or search term change

  // Memoized pagination logic
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage, entriesPerPage]); // Dependencies for pagination

  // Calculate total pages and entry range for display
  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);
  const startEntry =
    filteredTickets.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(
    currentPage * entriesPerPage,
    filteredTickets.length,
  );

  // Event Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Go back to page 1 on new search
  };

  const handleEntriesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1); // Go back to page 1
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1)); // Don't go below page 1
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages)); // Don't go beyond last page
  };

  // --- JSX Rendering ---
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      {/* Header: Show Entries & Search */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 gap-4">
        {/* Entries Selector */}
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
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        {" "}
        {/* Ensures table is scrollable on small screens */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Table Headers */}
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
            {/* Conditional Rendering for Table Rows */}
            {paginatedTickets.length > 0 ? (
              // Map over tickets if any exist
              paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* ID */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      #{ticket.id.substring(0, 8)}...
                    </div>
                  </td>
                  {/* Title */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    {ticket.title}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <StatusBadge status={ticket.status} />
                  </td>
                  {/* Reported By */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {ticket.creator.username}
                  </td>
                  {/* Date Created */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </td>
                  {/* All Messages Count */}
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                    {/* Use the _count field from the Prisma query */}
                    {ticket._count.messages > 0
                      ? ticket._count.messages
                      : "Initial"}{" "}
                    {/* Show count or 'Initial' if 0 replies */}
                  </td>
                  {/* Last Message Time */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {/* Use date-fns for relative time of the latest message */}
                    {ticket.messages[0]?.createdAt
                      ? formatDistanceToNowStrict(
                          new Date(ticket.messages[0].createdAt),
                          { addSuffix: true },
                        )
                      : "No Replies"}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    {/* Link to a future detail page */}
                    <Link
                      href={`/admin/customers/support/${ticket.id}`}
                      passHref
                    >
                      {/* Using <a> inside Link with button styling is common, but a button alone works too */}
                      <button
                        aria-label={`View details for ticket ${ticket.id.substring(0, 8)}`}
                        className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-100 transition-colors duration-150"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </Link>
                  </td>
                </tr>
              )) // End of map function
            ) : (
              // Row displayed when no tickets match filters
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No tickets found{searchTerm ? " matching your search" : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>{" "}
      {/* End of table scroll container */}
      {/* Footer: Showing Info & Pagination */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 gap-4">
        {/* Entries Info */}
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {filteredTickets.length} entries
        </div>
        {/* Pagination Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Previous
          </button>
          {/* Current Page Indicator */}
          <span className="px-3 py-1 border border-blue-500 bg-blue-500 text-white rounded-md text-sm font-medium">
            {currentPage}
          </span>
          {/* Add logic here for more page number buttons if needed */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Next
          </button>
        </div>
      </div>{" "}
      {/* End of footer */}
    </div> // End of main container div
  ); // End of return statement
}; // End of TicketTable component

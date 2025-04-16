"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TicketWithDetails } from "@/app/(customer)/customer/mymessages/page";
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import { MoreHorizontal } from "lucide-react";

// --- Helper: Status Badge Component ---
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

// --- Main Table Component for Customer ---
interface CustomerTicketListProps {
  tickets: TicketWithDetails[];
}

export const CustomerTicketList: React.FC<CustomerTicketListProps> = ({
  tickets,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Memoized filtering logic
  const filteredTickets = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) return tickets;
    return tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(lowerSearchTerm) ||
        ticket.id.toLowerCase().includes(lowerSearchTerm) ||
        ticket.status.toLowerCase().replace("_", " ").includes(lowerSearchTerm),
    );
  }, [tickets, searchTerm]);

  // Memoized pagination logic
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage, entriesPerPage]);

  // Calculations for display text
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
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 gap-4">
        {/* Show Entries Dropdown */}
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
              {/* Adjusted Headers */}
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
          {/* Careful check of this tbody block */}
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Conditional Rendering */}
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket) => (
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
                    {ticket._count.messages + 1}{" "}
                    {/* Add 1 for initial message */}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {/* Show last message time or creation time */}
                    {ticket.messages[0]?.createdAt
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
                      <button
                        aria-label={`View details for ticket ${ticket.title}`}
                        className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-100 transition-colors duration-150"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </Link>
                  </td>
                </tr>
              )) // End map function
            ) : (
              // Row for when no tickets are found
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  You haven&apos;t submitted any support messages yet.
                </td>
              </tr>
            )}{" "}
            {/* End conditional rendering */}
          </tbody>{" "}
          {/* End tbody */}
        </table>{" "}
        {/* End table */}
      </div>{" "}
      {/* End overflow-x-auto div */}
      {/* Footer Section */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 gap-4">
        {/* Showing Entries Info */}
        <div className="text-sm text-gray-600">
          Showing {startEntry} to {endEntry} of {filteredTickets.length} entries
        </div>
        {/* Pagination Controls */}
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
      {/* End footer */}
    </div> // End main container div
  ); // End return
}; // End component

// Export the component
export default CustomerTicketList;

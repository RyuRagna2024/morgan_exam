// app/(customer)/customer/mymessages/_components/CustomerTicketList.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
// Import the CORRECT list item type from the page or types file
import { TicketListItem } from "@/app/(customer)/customer/mymessages/page"; // Adjust path if needed
import { TicketStatus } from "@prisma/client"; // Keep this import
import { format, formatDistanceToNowStrict } from "date-fns";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
// Assuming StatusBadge is correctly adapted for dark mode
import { StatusBadge } from "@/components/shared/StatusBadge"; // Adjust path if needed
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Import Label

interface CustomerTicketListProps {
  tickets: TicketListItem[]; // Use the specific list item type from page.tsx/types.ts
}

export const CustomerTicketList: React.FC<CustomerTicketListProps> = ({
  tickets,
}) => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // --- Memoized Logic ---
  const filteredTickets = useMemo((): TicketListItem[] => {
    // Safety check
    if (!Array.isArray(tickets)) {
      console.warn("CustomerTicketList: 'tickets' prop is not an array.");
      return [];
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) {
      return tickets;
    }
    // Perform filtering
    return tickets.filter(
      (ticket) =>
        (ticket?.title?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.id?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.status?.toLowerCase().replace("_", " ") ?? "").includes(
          lowerSearchTerm,
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, searchTerm]); // Dependencies ARE correct here for filtering

  const paginatedTickets = useMemo((): TicketListItem[] => {
    // Safety check
    if (!Array.isArray(filteredTickets)) {
      console.warn("CustomerTicketList: 'filteredTickets' is not an array.");
      return [];
    }
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredTickets.slice(startIndex, startIndex + entriesPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTickets, currentPage, entriesPerPage]); // Dependencies ARE correct here for pagination

  // --- Calculations ---
  const totalFilteredTickets = filteredTickets?.length ?? 0;
  const totalPages = Math.ceil(totalFilteredTickets / entriesPerPage);
  const startEntry =
    totalFilteredTickets > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * entriesPerPage, totalFilteredTickets);

  // --- Event Handlers ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  const handleEntriesChange = (value: string) => {
    // Changed signature for shadcn Select
    setEntriesPerPage(Number(value));
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
    <Card>
      {/* Header with Filters */}
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        {/* Entries per page */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Label
            htmlFor="entries"
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            Show
          </Label>
          <Select
            value={String(entriesPerPage)}
            onValueChange={handleEntriesChange}
          >
            <SelectTrigger id="entries" className="w-[80px]">
              <SelectValue placeholder="Entries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        {/* Search */}
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Label htmlFor="search" className="sr-only">
            Search Messages
          </Label>
          <Input
            type="search"
            id="search"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by Subject, ID, Status..."
            className="pl-8 w-full md:w-[250px]"
          />
        </div>
      </CardHeader>

      {/* Table Area */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject / Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-center">Total Messages</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map(
                  (
                    ticket, // Type is TicketListItem
                  ) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {(ticket._count?.messages ?? 0) + 1}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {/* Use optional chaining ?. for safety */}
                        {ticket.messages?.[0]?.createdAt
                          ? formatDistanceToNowStrict(
                              new Date(ticket.messages[0].createdAt),
                              { addSuffix: true },
                            )
                          : formatDistanceToNowStrict(
                              new Date(ticket.createdAt),
                              { addSuffix: true },
                            )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/customer/mymessages/${ticket.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {searchTerm
                      ? "No messages match your search."
                      : "You haven't submitted any support messages yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Footer with Pagination */}
      <CardFooter className="flex flex-wrap items-center justify-between p-4 gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startEntry} to {endEntry} of {totalFilteredTickets} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            {" "}
            Previous{" "}
          </Button>
          {/* Optional: Display current page / total pages */}
          {/* <span className="text-sm font-medium px-2">{currentPage} / {totalPages}</span> */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            {" "}
            Next{" "}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomerTicketList;

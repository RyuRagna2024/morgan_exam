// app/(admin)/_components/AdminHeader.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";
import UserButton from "./UserButton";
import { cn } from "@/lib/utils";
// Import DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link"; // Import Link

// --- Define props for the header ---
interface AdminHeaderProps {
  hasNotifications: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ hasNotifications }) => {
  // Destructure prop
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-border",
        "bg-background px-4 md:px-6 sticky top-0 z-20 justify-end", // Ensure justify-end if search removed
      )}
    >
      {/* Search Bar Removed */}

      {/* Right Side Items */}
      <div className="flex items-center gap-4">
        {/* --- Notification Bell with Dropdown --- */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Wrap button in relative div for positioning the dot */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {/* --- Conditional Notification Dot --- */}
                {hasNotifications && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" /> // Simple red dot
                )}
                {/* --- End Dot --- */}
              </Button>
              <span className="sr-only">Notifications</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {" "}
            {/* Adjust width */}
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hasNotifications ? (
              // Placeholder for actual notification items
              <DropdownMenuItem asChild>
                {/* Link to the support tickets page */}
                <Link href="/admin/customers/support">
                  New/Updated Support Tickets
                </Link>
              </DropdownMenuItem>
            ) : (
              /* Add more items here later */
              <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            )}
            {/* Optional: Add a 'View All' link */}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/customers/support">
                {" "}
                {/* Adjust link */}
                View All Support Tickets
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* --- End Notification Bell --- */}
        <UserButton /> {/* Admin UserButton */}
      </div>
    </header>
  );
};

export default AdminHeader;

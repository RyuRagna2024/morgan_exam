// app/(customer)/_components/MainContentHeader.tsx
"use client";

import React from "react";
// Search Input removed
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react"; // Keep Bell or other icons
import UserButton from "./UserButton"; // Assuming this uses the Customer SessionProvider context

const MainContentHeader = () => {
  // UserButton will use the nearest SessionProvider (Customer context)
  return (
    // Flex container, push items to the end (right)
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-background px-4 md:px-6 sticky top-0 z-10">
      {" "}
      {/* Sticky header */}
      {/* Right Side Items */}
      <div className="flex items-center gap-4">
        {/* Example Notification Button */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        {/* User Button (Avatar, Dropdown) */}
        <UserButton />
      </div>
    </header>
  );
};

export default MainContentHeader;

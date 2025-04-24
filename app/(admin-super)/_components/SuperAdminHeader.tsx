// app/(admin-super)/_components/SuperAdminHeader.tsx
"use client";

import React from "react";
// Removed Input and Search imports
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import UserButton from "./UserButton";
import { cn } from "@/lib/utils";

const SuperAdminHeader = () => {
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-border",
        "bg-background",
        "px-4 md:px-6",
        "sticky top-0 z-10",
        "justify-end", // <<< ADDED: Push remaining items to the right
      )}
    >
      {/* Search Bar Removed */}

      {/* Right Side: Icons & User Menu */}
      {/* Removed flex-1 and justify-end from this inner div */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <UserButton />
      </div>
    </header>
  );
};

export default SuperAdminHeader;

// app/(admin)/_components/AdminHeader.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";
import UserButton from "./UserButton"; // Uses UserButton from app/(admin)/_components
import { cn } from "@/lib/utils";

const AdminHeader = () => {
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-border", // Header styling
        "bg-background", // Theme background
        "px-4 md:px-6", // Padding
        "sticky top-0 z-20", // Sticky within main scroll area, lower z than sidebar button
      )}
    >
      {/* Left Side: Search Bar */}
      <div className="relative flex-1 mr-4 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]" // Muted background for input
        />
      </div>

      {/* Right Side: Icons & User Menu */}
      <div className="flex flex-1 items-center justify-end gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <UserButton /> {/* Renders admin UserButton */}
      </div>
    </header>
  );
};

export default AdminHeader;

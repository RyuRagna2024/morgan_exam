// app/(admin-super)/_components/SuperAdminHeader.tsx
"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";
import UserButton from './UserButton'; // The UserButton component we fixed
import { cn } from '@/lib/utils'; // <<< IMPORT cn UTILITY ADDED

const SuperAdminHeader = () => {
    return (
        <header className={cn( // Use cn here
            "flex h-16 shrink-0 items-center border-b border-border", // Basic header style
            "bg-background", // Use theme background
            "px-4 md:px-6", // Padding
            "sticky top-0 z-10" // Sticky header within main scroll area
        )}>
            {/* Left Side: Search Bar */}
            <div className="relative flex-1 mr-4 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search anything..."
                      className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]" // Use muted background for input
                  />
            </div>

            {/* Right Side: Icons & User Menu */}
            <div className="flex flex-1 items-center justify-end gap-4">
                 <Button variant="ghost" size="icon" className="rounded-full">
                     <Bell className="h-5 w-5" />
                     <span className="sr-only">Notifications</span>
                 </Button>
                <UserButton /> {/* User button uses Session Context */}
            </div>
        </header>
    );
}

export default SuperAdminHeader;
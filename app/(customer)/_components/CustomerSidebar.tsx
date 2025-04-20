// app/(customer)/_components/CustomerSidebar.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SessionUser } from "../SessionProvider";
import ProfileSection from "./(sidebar)/ProfileSection";
import NavigationLinks from "./(sidebar)/NavigationLinks";

interface CustomerSidebarProps {
  user: SessionUser;
  orderCount: number;
  wishlistCount: number;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  user,
  orderCount,
  wishlistCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        // --- Updated classes for dark mode ---
        "flex h-full flex-col border-r bg-background", // Use bg-background for semantic color
        "border-border", // Use border-border which respects dark mode CSS vars
        "transition-all duration-300 relative",
        // --- End of updates ---
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Sidebar Toggle Button - Adjust colors for dark mode if desired */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-white hover:bg-slate-500 ring-2 ring-white dark:bg-slate-700 dark:hover:bg-slate-600 dark:ring-gray-800" // Added dark variants
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Profile Section */}
      {/* ProfileSection will handle its own dark mode styles internally */}
      <ProfileSection user={user} isCollapsed={isCollapsed} />

      {/* Navigation Links Component */}
      {/* NavigationLinks will handle its own dark mode styles internally */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        <NavigationLinks isCollapsed={isCollapsed} />
      </nav>

      {/* Optional Footer */}
      {!isCollapsed && (
        // --- Updated classes for dark mode ---
        <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">
          {/* Use border-border and text-muted-foreground */}
          {/* Footer content if needed */}
        </div>
        // --- End of updates ---
      )}
    </aside>
  );
};

export default CustomerSidebar;

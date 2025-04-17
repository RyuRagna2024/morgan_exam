// app/(customer)/_components/CustomerSidebar.tsx
"use client";

import React, { useState } from "react";
// Keep necessary imports like cn, icons, SessionUser, ProfileSection, NavigationLinks
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
    // --- Remove fixed positioning, use h-full relative to parent ---
    <aside
      className={cn(
        // Removed: fixed left-0 top-0 z-40 h-screen
        "flex h-full flex-col border-r border-sidebar-border bg-white transition-all duration-300 relative", // Add relative for toggle button positioning
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Sidebar Toggle Button - Adjust positioning relative to aside */}
      <button
        onClick={toggleCollapse}
        // Position relative to the parent <aside>
        className="absolute -right-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-white hover:bg-slate-500 ring-2 ring-white"
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Profile Section */}
      <ProfileSection user={user} isCollapsed={isCollapsed} />

      {/* Navigation Links Component */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        <NavigationLinks isCollapsed={isCollapsed} />
      </nav>

      {/* Optional Footer */}
      {!isCollapsed && (
        <div className="border-t border-sidebar-border p-3 text-center text-xs text-gray-500">
          {/* Footer content if needed */}
        </div>
      )}
    </aside>
    // Removed the mobile overlay div from here - should be handled by layout if needed
  );
};

export default CustomerSidebar;

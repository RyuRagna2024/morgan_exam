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
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    // --- Sidebar Container ---
    // Use relative positioning as the base for the absolute button
    // REMOVE overflow-x-hidden FROM HERE
    <aside
      className={cn(
        "flex h-screen flex-col", // Full height
        "border-r border-border bg-background",
        "transition-all duration-300 relative z-30", // Keep relative & z-index
        isCollapsed ? "w-16" : "w-64", // Dynamic width
        // overflow-x-hidden REMOVED
      )}
    >
      {/* --- Sidebar Toggle Button --- */}
      {/* Positioned absolutely relative to the aside container */}
      {/* Ensure its parent does not clip it */}
      <button
        onClick={toggleCollapse}
        className={cn(
          "absolute z-50 flex h-6 w-6 items-center justify-center rounded-full",
          "top-5", // Vertical position
          // Horizontal position: Adjust based on collapsed state
          // When expanded (-right-3): pushes it outside the aside boundary
          // When collapsed (left-full -translate-x-1/2): centers it on the boundary edge
          isCollapsed ? "left-full -translate-x-1/2" : "-right-3",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "ring-2 ring-background",
          "transition-all duration-300", // Transition position/opacity etc.
        )}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* --- Profile Section (Non-Scrolling Part) --- */}
      {/* Add overflow-hidden HERE if content inside might overflow horizontally */}
      <div className="flex-shrink-0 overflow-hidden">
        <ProfileSection user={user} isCollapsed={isCollapsed} />
      </div>

      {/* --- Scrollable Navigation Area --- */}
      {/* Add overflow-hidden HERE as well */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="px-3 py-4 space-y-2">
          <NavigationLinks isCollapsed={isCollapsed} />
        </nav>
      </div>

      {/* --- Optional Footer (Non-Scrolling Part) --- */}
      {/* Add overflow-hidden HERE if needed */}
      {!isCollapsed && (
        <div className="flex-shrink-0 border-t border-border p-3 text-center text-xs text-muted-foreground overflow-hidden">
          {/* Footer content */}
        </div>
      )}
    </aside>
  );
};

export default CustomerSidebar;

// app/(manager)/_components/ManagerSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react"; // Import necessary icons
import { cn } from "@/lib/utils";
import { managerNavigation } from "./ManagerNavItems"; // Import manager navigation data
import { User } from "lucia"; // Import User type

interface ManagerSidebarProps {
  user: User; // Receive user data if needed
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // We don't need openDropdown state for now as manager links are top-level
  // const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Function to toggle sidebar collapse state
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    // Mimic AdminSidebar structure and styling
    <div
      className={cn(
        "relative z-30 flex h-full flex-col bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo/Name Section - Adjusted for Manager */}
      <div className="flex items-center justify-center px-3 h-[88px] border-b border-border">
        {" "}
        {/* Match potential Navbar height */}
        <Link
          href="/manager"
          className="flex items-center space-x-2"
          title="Manager Dashboard"
        >
          {isCollapsed ? (
            <span className="text-2xl font-bold text-primary">M</span>
          ) : (
            <span className="text-xl font-bold text-primary">Manager</span>
          )}
        </Link>
      </div>

      {/* Toggle Button - Copied from AdminSidebar */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-[30px] z-50 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ring-1 ring-border"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="select-scroll flex-1 overflow-y-auto py-4">
        {" "}
        {/* Adjusted padding */}
        <div className="space-y-1 px-3">
          {managerNavigation.map((item) => (
            // Use Link directly for top-level items
            <Link
              key={item.label}
              href={item.href}
              title={item.label} // Add title for accessibility when collapsed
              className={cn(
                "flex items-center rounded-lg px-3 py-3 text-sm transition-colors group", // Base classes from Admin
                pathname === item.href ||
                  (pathname.startsWith(item.href) && item.href !== "/manager") // Active state logic
                  ? "bg-primary/10 text-primary font-medium" // Active classes (adjust if needed)
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground", // Inactive classes
                isCollapsed ? "justify-center" : "", // Center icon when collapsed
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} // Adjust margin when collapsed/expanded
                />
              )}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
            // If you add dropdowns later, reintroduce the button/dropdown logic here
          ))}
        </div>
      </div>

      {/* Optional: Add user info at the bottom if desired */}
      {!isCollapsed && (
        <div className="mt-auto border-t border-border p-3 text-center text-xs text-muted-foreground">
          Logged in as {user.displayName || user.username}
        </div>
      )}
    </div>
  );
};

export default ManagerSidebar;

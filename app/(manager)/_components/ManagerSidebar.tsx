// app/(manager)/_components/ManagerSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { managerNavigation } from "./ManagerNavItems"; // Ensure this import path is correct
import { useSession } from "../SessionProvider"; // Use Manager's SessionProvider hook
import ProfileSection from "./profile/ProfileSection"; // Assuming this component exists

// Interface remains empty if session context provides user
interface ManagerSidebarProps {}

const ManagerSidebar: React.FC<ManagerSidebarProps> = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useSession(); // Get user from context

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Optional: Placeholder/Loading state if user isn't immediately available
  if (!user) {
    return (
      <aside // Use aside semantic tag for sidebar
        className={cn(
          // Ensure h-full is applied for the placeholder too
          "relative z-30 flex h-full flex-col bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64", // Use defined widths
        )}
        aria-label="Sidebar loading"
      >
        <div className="p-4 text-muted-foreground text-center">Loading...</div>
      </aside>
    );
  }

  // Main return when user is available
  return (
    // Use aside semantic tag
    <aside
      className={cn(
        // Ensure h-full is on the outermost element
        "relative z-30 flex h-full flex-col bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64", // Control width based on state
      )}
      aria-label="Manager Sidebar"
    >
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        // *** TEST A: MODIFIED POSITIONING - REMOVED translate-x-1/2 ***
        className={cn(
          "absolute z-50 flex h-6 w-6 items-center justify-center rounded-full",
          "top-4", // Keep vertical position
          "right-0", // Position right edge flush with parent edge
          // "translate-x-1/2", // <-- Temporarily removed for testing
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "ring-1 ring-border", // Adjusted ring color
          "transition-all duration-300",
        )}
        // *** END MODIFIED POSITIONING ***
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Profile Section */}
      {user ? (
        <ProfileSection user={user} isCollapsed={isCollapsed} />
      ) : (
        <div className="p-6 border-b border-border flex items-center justify-center h-[160px] shrink-0">
          <div className="h-10 w-10 border-2 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Navigation Links Section */}
      <div className="select-scroll flex-1 overflow-y-auto py-4">
        <nav aria-label="Main navigation">
          <div className="space-y-1 px-3">
            {managerNavigation.map((item) => {
              const active =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/manager");
              const Icon = item.icon;
              const tooltipLabel = item.label;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-3 text-sm transition-colors group relative",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                    isCollapsed ? "justify-center" : "",
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isCollapsed ? "mx-auto" : "mr-3",
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-900 text-white rounded text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity delay-300 duration-200 z-20 pointer-events-none">
                      {tooltipLabel}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default ManagerSidebar;

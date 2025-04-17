// app/(manager)/_components/ManagerSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { managerNavigation } from "./ManagerNavItems";
// import { User } from "lucia"; // No longer needed as prop
import { useSession } from "../SessionProvider"; // <<< IMPORT useSession
import ProfileSection from "./profile/ProfileSection";

// Remove user prop from interface
interface ManagerSidebarProps {
  // No props needed if using session
}

// Remove user prop from function signature
const ManagerSidebar: React.FC<ManagerSidebarProps> = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useSession(); // <<< GET user from session

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // --- Add check for user existence ---
  // Although layout should protect, good practice in client component
  if (!user) {
    // Maybe return a simplified sidebar or null if user isn't loaded yet
    return (
      <div
        className={cn(
          "relative z-30 flex h-full flex-col bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Placeholder or loading state */}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative z-30 flex h-full flex-col bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Toggle Button - Repositioned slightly */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ring-1 ring-border"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* --- Profile Section Added Here --- */}
      <ProfileSection user={user} isCollapsed={isCollapsed} />

      {/* Sidebar Content (Navigation) */}
      <div className="select-scroll flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {managerNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center rounded-lg px-3 py-3 text-sm transition-colors group",
                pathname === item.href ||
                  (pathname.startsWith(item.href) && item.href !== "/manager")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                isCollapsed ? "justify-center" : "",
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
                />
              )}
              {!isCollapsed && <span>{item.label}</span>}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white rounded text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer removed as profile section shows user info */}
    </div>
  );
};

export default ManagerSidebar;

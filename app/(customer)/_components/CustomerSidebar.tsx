// app/(customer)/_components/CustomerSidebar.tsx
"use client";

import React, { useState } from "react";
// Remove Link and usePathname imports if they are solely handled by NavigationLinks
// import Link from "next/link";
// import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Import SessionUser from the CORRECT (customer) provider ---
import { SessionUser } from "../SessionProvider";
import ProfileSection from "./(sidebar)/ProfileSection"; // Assuming ProfileSection exists here
import NavigationLinks from "./(sidebar)/NavigationLinks"; // *** IMPORT NavigationLinks ***

interface CustomerSidebarProps {
  user: SessionUser; // Uses the SessionUser from ../SessionProvider
  orderCount: number;
  wishlistCount: number;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  user,
  orderCount, // Keep these if ProfileSection or NavigationLinks need them
  wishlistCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // const pathname = usePathname(); // Probably not needed here anymore

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={toggleCollapse}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-white transition-all duration-300", // Adjust colors/borders
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-white hover:bg-slate-500 ring-2 ring-white"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Profile Section */}
        {/* Pass relevant props down */}
        <ProfileSection user={user} isCollapsed={isCollapsed} />

        {/* Navigation Links Component */}
        {/* Render the imported component and pass isCollapsed state */}
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
    </>
  );
};

export default CustomerSidebar;

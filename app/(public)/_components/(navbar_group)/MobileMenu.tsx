// app/(public)/_components/(navbar_group)/MobileMenu.tsx
"use client";

import React from "react"; // Import React
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon } from "./NavIcons"; // Ensure CloseIcon is imported
import { Route } from "./routes"; // Ensure Route interface is imported or defined
import { cn } from "@/lib/utils"; // Import cn utility

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  routes: Route[];
  dashboardUrl?: string;
  onDashboardClick?: (e: React.MouseEvent) => void;
}

const MobileMenu = ({
  isOpen,
  onClose,
  menuRef,
  routes,
  dashboardUrl,
  onDashboardClick,
}: MobileMenuProps) => {
  const pathname = usePathname();

  return (
    <div
      ref={menuRef}
      // Dark theme styles using theme variables and specifics
      className={cn(
        "fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm border-l shadow-lg z-50 transition-transform duration-300 ease-in-out",
        "bg-background border-border", // Use theme background and border
        // If you prefer the gradient: "bg-gradient-to-b from-gray-900 to-black border-red-700"
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="p-4 sm:p-6 flex flex-col h-full">
        {/* Header - Dark Theme */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          {" "}
          {/* Use theme border */}
          <h2 className="text-lg font-semibold text-foreground">Menu</h2>{" "}
          {/* Use theme foreground */}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground" // Use theme text colors
            aria-label="Close menu"
          >
            <CloseIcon /> {/* Ensure icon renders */}
          </button>
        </div>

        {/* Navigation Links - Dark Theme */}
        <nav className="flex flex-col gap-2 flex-grow">
          {routes.map((route) => {
            // Special handling for dashboard link
            if (route.name === "My Dashboard") {
              return dashboardUrl && onDashboardClick ? (
                <a // Use <a> tag for the custom click handler
                  key={route.path}
                  href={dashboardUrl} // Provide href for semantics/SEO
                  onClick={(e) => {
                    // Execute the passed handler (which includes closing the menu)
                    if (onDashboardClick) onDashboardClick(e);
                  }}
                  className={cn(
                    "block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200",
                    pathname === dashboardUrl
                      ? "text-primary-foreground bg-primary" // Active style using theme primary
                      : "text-foreground hover:text-foreground hover:bg-accent", // Default style using theme colors
                  )}
                >
                  {route.name}
                </a>
              ) : null; // Don't render if no dashboard path or handler
            }
            // Standard links
            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={onClose} // Close menu on standard link click
                className={cn(
                  "block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200",
                  pathname === route.path
                    ? "text-primary-foreground bg-primary" // Active style
                    : "text-foreground hover:text-foreground hover:bg-accent", // Default style
                )}
              >
                {route.name}
              </Link>
            );
          })}
        </nav>
        {/* Optional Footer area if needed */}
        {/* <div className="mt-auto pt-4 border-t border-border"> ... </div> */}
      </div>
    </div>
  );
};

export default MobileMenu;

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import ProfileSection from "./(sidebar)/ProfileSection";
import StatsSection from "./(sidebar)/StatsSection";
import NavigationLinks from "./(sidebar)/NavigationLinks";
import { SessionUser } from "@/app/SessionProvider";

interface CustomerSidebarProps {
  user: SessionUser;
  orderCount: number;
  wishlistCount: number;
}

export default function CustomerSidebar({
  user,
  orderCount,
  wishlistCount,
}: CustomerSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document
      .querySelector("main")
      ?.classList.remove(isCollapsed ? "ml-64" : "ml-16");
    document
      .querySelector("main")
      ?.classList.add(isCollapsed ? "ml-16" : "ml-64");
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative h-full">
      {/* --- Modified Aside --- */}
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-slate-700 text-white fixed top-0 left-0 h-full transition-all duration-300 flex flex-col pt-16 z-10`} // Added flex flex-col, removed overflow-hidden
      >
        {/* Top Section (Profile + Stats) - Fixed Height */}
        <div className="flex-shrink-0">
          {" "}
          {/* Prevents this section from growing/shrinking */}
          <ProfileSection user={user} isCollapsed={isCollapsed} />
          {!isCollapsed && (
            <StatsSection
              orderCount={orderCount}
              wishlistCount={wishlistCount}
            />
          )}
        </div>

        {/* Navigation Links Section (Scrollable) */}
        <div className="flex-grow overflow-y-auto">
          {" "}
          {/* Takes remaining space and allows vertical scrolling */}
          <NavigationLinks isCollapsed={isCollapsed} currentPath={pathname} />
        </div>
        {/* --- End Modified Aside Content Structure --- */}
      </aside>

      {/* Toggle Button - position remains the same */}
      <div
        className={`fixed ${
          isCollapsed ? "left-16" : "left-64"
        } top-20 transition-all duration-300 z-20`} // Adjusted top slightly to match screenshot better, was top-100
      >
        <button
          onClick={toggleSidebar}
          className="bg-teal-500 text-white p-2 rounded-r-md w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}

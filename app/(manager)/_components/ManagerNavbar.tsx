// app/(manager)_components/ManagerNavbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import UserButton from "./UserButton"; // Import UserButton specific to manager context if needed
import TierBadge from "@/app/(public)/_components/(navbar_group)/TierBadge"; // Import shared TierBadge
import { Sun, Moon } from "@/app/(public)/_components/(navbar_group)/NavIcons"; // Import shared icons
import { cn } from "@/lib/utils"; // Import cn utility

interface ManagerNavbarProps {}

const ManagerNavbar: React.FC<ManagerNavbarProps> = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // Helper to render the theme toggle button
  const renderThemeToggleButton = () => {
    if (!mounted) {
      return (
        <div
          className="p-1 w-[calc(1.25rem+0.5rem)] h-[calc(1.25rem+0.5rem)]"
          aria-hidden="true"
        />
      );
    }
    return (
      <button
        onClick={toggleTheme}
        className="text-muted-foreground hover:text-foreground relative transition-colors p-1 rounded-full hover:bg-accent" // Use theme-aware colors
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </button>
    );
  };

  return (
    // Changed to sticky, use theme background/border
    // Set a consistent height, e.g., h-16 (64px) or h-[70px]
    <nav className="sticky top-0 z-30 h-16 shrink-0 bg-background text-foreground shadow-sm border-b border-border px-4 md:px-8">
      <div className="flex items-center justify-end h-full w-full">
        {" "}
        {/* Ensure content aligns to end */}
        <div className="flex items-center space-x-4">
          {" "}
          {/* Spacing for right-aligned items */}
          {/* Theme Toggle Button */}
          {renderThemeToggleButton()}
          {/* UserButton + TierBadge Wrapper */}
          <div className="relative flex-shrink-0">
            {/* Ensure UserButton uses manager's session context */}
            <UserButton className="text-lg" />
            <div className="absolute -bottom-1 -right-1 z-10">
              <TierBadge />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ManagerNavbar;

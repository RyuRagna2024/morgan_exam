// app/(customer)/_components/MainContentHeader.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import UserButton from "./UserButton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MainContentHeader = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const renderThemeToggleButton = () => {
    if (!mounted) {
      return (
        <div
          className="p-1 w-[calc(1.25rem+0.5rem)] h-[calc(1.25rem+0.5rem)] rounded-full"
          aria-hidden="true"
        />
      );
    }
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "text-muted-foreground hover:text-foreground relative transition-colors p-1 rounded-full hover:bg-accent",
        )}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {" "}
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}{" "}
      </button>
    );
  };

  return (
    // --- Adjusted padding: Keep left same as main, increase right to compensate for scrollbar ---
    // Base: pl-6 (1.5rem), pr-10 (2.5rem = 1.5rem + 1rem padding for scrollbar)
    // Large: lg:pl-8 (2rem), lg:pr-12 (3rem = 2rem + 1rem padding for scrollbar)
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background pl-6 pr-10 lg:pl-8 lg:pr-12 sticky top-0 z-10">
      {/* Left Side: Home Button */}
      <div>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/" aria-label="Go to Homepage">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} align="start">
              <p>Go to Homepage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right Side Items (Grouped) */}
      {/* This group will now appear aligned with the content below */}
      <div className="flex items-center gap-4">
        {renderThemeToggleButton()}
        <UserButton />
      </div>
    </header>
  );
};

export default MainContentHeader;

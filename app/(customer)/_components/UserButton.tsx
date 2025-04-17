// app/(customer)/_components/UserButton.tsx
"use client";

import { cn } from "@/lib/utils";
import { Check, LogOutIcon, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

import UserAvatar from "./UserAvatar";
import { useSession } from "../SessionProvider"; // Adjust path if needed
import { logout } from "@/app/(auth)/actions"; // Adjust path if needed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger, // Correct import
} from "@/components/ui/dropdown-menu";
// Removed incorrect import: import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Loader2 } from "lucide-react";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  // Use useSession hook
  const { user } = useSession(); // user can be SessionUser | null
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoggingOut(true);
      setIsOpen(true); // Keep open during logout attempt
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for visual feedback
      await logout();
      // No need to setIsOpen(false) here, as logout should trigger a redirect/page change
    } catch (error) {
      console.error("Logout failed:", error);
      // Keep the dropdown open on error to show the user it failed
      setIsLoggingOut(false);
      // Do not close the dropdown on error: setIsOpen(false);
    }
    // Removed finally block as logout success handles navigation
  };

  // --- Add conditional rendering ---
  // If there's no user, don't render the button
  if (!user) {
    // Optionally return a login button or just null
    return null;
  }

  // --- If user exists, render the button ---
  // TypeScript now knows 'user' is not null within this block
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full", className)}>
          {/* Safe to access user.avatarUrl here */}
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Safe to access user.displayName here */}
        <DropdownMenuLabel>Logged in as {user.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/customer`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            My Account
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                System default
                {theme === "system" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                Light
                {theme === "light" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                Dark
                {theme === "dark" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center justify-between focus:bg-destructive focus:text-destructive-foreground", // Added focus styles for destructive action
            isLoggingOut && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="flex items-center">
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOutIcon className="mr-2 size-4" />
                <span>Logout</span>
              </>
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

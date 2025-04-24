// app/(admin-super)/_components/UserButton.tsx
"use client";

import { cn } from "@/lib/utils";
// Removed UserIcon as Profile Settings link was commented out
import { LogOutIcon, Loader2 } from "lucide-react";
// Removed theme imports
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import UserAvatar from "./UserAvatar";
import { useSession } from "../SessionProvider";
import { logout } from "@/app/(auth)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator, // Keep separator
  DropdownMenuTrigger,
  // Removed theme-related dropdown imports
} from "@/components/ui/dropdown-menu";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    setIsOpen(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn("flex-none rounded-full", className)}
          aria-label="Open user menu"
        >
          <UserAvatar avatarUrl={user.avatarUrl} size={32} />{" "}
          {/* Using size from previous super-admin example */}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Logged in as {user.displayName}</DropdownMenuLabel>
        {/* Removed Separator and potential Profile Settings link */}
        {/* Removed Separator and Theme Submenu */}
        <DropdownMenuSeparator /> {/* Keep one separator before Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center justify-between cursor-pointer focus:bg-destructive focus:text-destructive-foreground",
            isLoggingOut && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="flex items-center">
            {isLoggingOut ? (
              <>
                {" "}
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                <span>Logging out...</span>{" "}
              </>
            ) : (
              <>
                {" "}
                <LogOutIcon className="mr-2 size-4" /> <span>Logout</span>{" "}
              </>
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

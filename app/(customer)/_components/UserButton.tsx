// app/(customer)/_components/UserButton.tsx
"use client";

import { cn } from "@/lib/utils";
import { LogOutIcon, Loader2 } from "lucide-react";
import Link from "next/link"; // Keep if needed
import { useState } from "react";
import toast from "react-hot-toast"; // <<< ADD THIS IMPORT

import UserAvatar from "./UserAvatar";
import { useSession } from "../SessionProvider";
import { logout } from "@/app/(auth)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TierBadge from "@/app/(public)/_components/(navbar_group)/TierBadge";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
      toast.error("Logout failed. Please try again."); // Now toast is defined
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full relative", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
          <div className="absolute -bottom-1 -right-1">
            <TierBadge />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Logged in as {user.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Removed items */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "focus:bg-destructive/80 focus:text-destructive-foreground",
          )}
        >
          <div className="flex items-center w-full">
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOutIcon className="mr-2 size-4" />
            )}
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

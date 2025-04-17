// app/(manager)/_components/UserButton.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { useSession } from "../SessionProvider";
import { logout } from "@/app/(auth)/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import avatarPlaceholder from "../assets/avatar-placeholder.png"; // <<< Your static import
import { StaticImageData } from "next/image"; // <<< IMPORT StaticImageData type

interface UserButtonProps {
  className?: string;
}

const UserButton: React.FC<UserButtonProps> = ({ className }) => {
  const { user } = useSession();

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await logout();
      toast.success("Logged out successfully.", { id: toastId });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.", { id: toastId });
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n?.[0] || "")
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (!user) {
    return null;
  }

  // --- Determine the correct src for AvatarImage ---
  // If user has an avatarUrl, use it. Otherwise, use the .src property of the imported placeholder.
  const avatarSrc =
    user.avatarUrl || (avatarPlaceholder as StaticImageData).src; // <<< FIX HERE

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0",
            className,
          )}
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            {/* Use the determined avatarSrc */}
            <AvatarImage
              src={avatarSrc} // <<< Use the corrected variable
              alt={user.displayName ?? user.username}
            />
            <AvatarFallback>
              {getInitials(user.displayName ?? user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName ?? user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/manager/settings"
            className="cursor-pointer w-full flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;

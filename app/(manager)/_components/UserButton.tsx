// app/(manager)/_components/UserButton.tsx

"use client"; // This component needs client-side interactivity (dropdown, click handlers)

import React from "react";
import Link from "next/link"; // For the settings link
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Adjust import path if needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Adjust import path
import { Button } from "@/components/ui/button"; // Adjust import path
import { LogOut, User as UserIcon, Settings } from "lucide-react"; // Import necessary icons
import { User } from "lucia"; // Import Lucia's User type
import { logout } from "@/app/(auth)/actions"; // Import the central logout server action
import { toast } from "sonner"; // Import sonner for notifications
import { cn } from "@/lib/utils"; // Import utility for class names

// Define the expected props for this component
interface UserButtonProps {
  user: User; // Receive the full user object as a prop
  className?: string; // Allow optional custom styling from parent
}

const UserButton: React.FC<UserButtonProps> = ({ user, className }) => {
  // Handler for the logout action
  const handleLogout = async () => {
    const toastId = toast.loading("Logging out..."); // Show loading toast
    try {
      await logout(); // Call the server action
      toast.success("Logged out successfully.", { id: toastId }); // Update toast on success
      // Redirect is handled by the server action itself
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.", { id: toastId }); // Update toast on error
    }
  };

  // Helper function to generate initials from a name
  const getInitials = (name: string): string => {
    if (!name) return "?"; // Handle cases where name might be empty

    return name
      .split(" ") // Split name into parts
      .map((n) => n?.[0] || "") // Get the first character of each part (handle potential empty parts)
      .filter(Boolean) // Remove any empty strings from the map result
      .slice(0, 2) // Optional: Limit to max 2 initials
      .join("") // Join the characters
      .toUpperCase(); // Convert to uppercase
  };

  // Fallback avatar if user.avatarUrl is null
  const fallbackAvatar = "/assets/avatar-placeholder.png"; // Adjust path as necessary

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* The Button that triggers the dropdown */}
        <Button
          variant="ghost"
          // Use cn to merge base classes with any className passed via props
          className={cn(
            "relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0",
            className,
          )} // Adjusted size and removed focus ring for cleaner look maybe
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            {" "}
            {/* Slightly smaller avatar for padding */}
            <AvatarImage
              src={user.avatarUrl || fallbackAvatar} // Use fallback if URL is null
              alt={user.displayName ?? user.username}
            />
            <AvatarFallback>
              {getInitials(user.displayName ?? user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* The Content of the dropdown menu */}
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* Label showing user's name and email */}
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

        {/* Link to the Settings page */}
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

        {/* Logout Button/Item */}
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

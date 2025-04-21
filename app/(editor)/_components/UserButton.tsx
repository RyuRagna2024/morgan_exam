// app/(editor)/_components/UserButton.tsx
"use client";

import { cn } from "@/lib/utils";
import {
  Check,
  LogOutIcon,
  Monitor,
  Moon,
  Sun,
  UserIcon,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

import UserAvatar from "./UserAvatar"; // Use EDITOR's UserAvatar
// --- Use the EDITOR's Session Provider Hook ---
import { useSession } from "../SessionProvider";
// --- End Change ---
import { logout } from "@/app/(auth)/actions"; // Logout action is shared
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed incorrect import if present: import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession(); // Now uses Editor's context
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoggingOut(true);
      setIsOpen(true); // Keep open during attempt
      await new Promise((resolve) => setTimeout(resolve, 500)); // Visual delay
      await logout();
      // Redirect is handled by logout action
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
      // Keep open on error setIsOpen(false);
    }
  };

  // If no user in editor context, don't render (shouldn't happen due to layout guard)
  if (!user) {
    return null;
  }

  // Render the button for the editor
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Editor: {user.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Remove "My Account" link or point it to an editor profile page if desired */}
        {/* <Link href={`/editor/profile`}> // Example editor profile link
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            Editor Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator /> */}

        {/* Theme Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" /> Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                {" "}
                <Monitor className="mr-2 size-4" /> System{" "}
                {theme === "system" && <Check className="ms-2 size-4" />}{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                {" "}
                <Sun className="mr-2 size-4" /> Light{" "}
                {theme === "light" && <Check className="ms-2 size-4" />}{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                {" "}
                <Moon className="mr-2 size-4" /> Dark{" "}
                {theme === "dark" && <Check className="ms-2 size-4" />}{" "}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />

        {/* Logout Item */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex items-center justify-between focus:bg-destructive focus:text-destructive-foreground",
            isLoggingOut && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="flex items-center">
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

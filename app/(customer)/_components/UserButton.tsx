// app/(customer)/_components/UserButton.tsx
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

import UserAvatar from "./UserAvatar"; // Uses local UserAvatar
import { useSession } from "../SessionProvider"; // <<< Uses Customer SessionProvider
import { logout } from "@/app/(auth)/actions";
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
// --- Import TierBadge ---
// Assuming the public TierBadge component can be reused and its internal
// useSession hook will correctly pick up the NEAREST SessionProvider context
import TierBadge from "@/app/(public)/_components/(navbar_group)/TierBadge";
// If TierBadge MUST use the root context, you'd need a different approach or
// create a customer-specific TierBadge that imports useSession from ../SessionProvider

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession(); // Gets user data from Customer SessionProvider
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoggingOut(true);
      setIsOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null; // Don't render if no user in this context
  }

  // User is guaranteed to exist here and should have the 'tier' property
  // because we fixed the Customer SessionProvider and Layout
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {/* --- Wrap Avatar and Badge for positioning --- */}
        <button className={cn("flex-none rounded-full relative", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
          {/* --- Render TierBadge --- */}
          {/* Position it relative to the button/avatar */}
          <div className="absolute -bottom-1 -right-1">
            {/* TierBadge uses its own internal useSession, which should inherit
                 from the nearest provider (Customer SessionProvider) */}
            <TierBadge />
          </div>
          {/* --- End TierBadge rendering --- */}
        </button>
        {/* --- End Wrapper --- */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
              {/* Theme options... */}
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" /> System default{" "}
                {theme === "system" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" /> Light{" "}
                {theme === "light" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" /> Dark{" "}
                {theme === "dark" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(/* ... */)}
        >
          {/* Logout content... */}
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

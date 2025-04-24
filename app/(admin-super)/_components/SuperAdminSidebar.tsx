// app/(admin-super)/_components/SuperAdminSidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '../SessionProvider'; // Use session from this layout
import UserAvatar from './UserAvatar'; // Use local avatar
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Users, BarChart2, Settings, LogOut, ChevronDown, LayoutDashboard, Bell, Star, CreditCard, HelpCircle, Sun, Moon } from 'lucide-react'; // Add/remove icons as needed
import { useTheme } from 'next-themes';

// Dummy Nav Items based on example image (replace with actual routes)
const dummyNavItems = [
    { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard }, // Point base to routing hub or actual dashboard
    { name: "Notifications", href: "#", icon: Bell },
    { name: "Assign Roles", href: "#", icon: Star },
    { name: "Billing", href: "#", icon: CreditCard },
    { name: "Help", href: "#", icon: HelpCircle },
    // Add more items based on example if needed (Audience, Posts, Schedules, Income, Promote)
];

const SuperAdminSidebar = () => {
    const pathname = usePathname();
    const { user } = useSession(); // Get user data for display
    const { theme, setTheme } = useTheme();

    if (!user) {
        // Should ideally not happen due to layout protection, but good practice
        return null;
    }

    return (
        <aside className={cn(
            "flex h-screen w-64 flex-col", // Fixed width, full height
            "border-r border-border bg-card", // Theme colors
            "relative z-30" // Ensure it's above content but potentially below modals
        )}>
            {/* 1. Logo/Title Section */}
            <div className="flex h-16 items-center border-b border-border px-6 shrink-0">
                 {/* Replace with your actual logo component or text */}
                 <Link href="/super-admin" className="flex items-center gap-2 font-semibold text-lg text-foreground">
                     <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">O</div> {/* Example icon */}
                     <span>Super Admin</span> {/* Or your app name */}
                 </Link>
            </div>

            {/* 2. User Info Dropdown (optional based on example) */}
             {/* <div className="border-b border-border px-4 py-3 shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <div className='flex items-center gap-2'>
                                <UserAvatar avatarUrl={user.avatarUrl} size={24} />
                                <span className='text-sm font-medium truncate'>{user.displayName}</span>
                            </div>
                             <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             </div> */}

            {/* 3. Scrollable Navigation Section */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {dummyNavItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10", // Base & Hover
                            pathname === item.href || (item.href !== "/super-admin" && pathname.startsWith(item.href))
                                ? "bg-primary/10 text-primary font-semibold" // Active state
                                : ""
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                         {/* Optional: Add badges like in the example */}
                         {/* {item.name === 'Notifications' && <Badge className="ml-auto">3</Badge>} */}
                    </Link>
                ))}
            </nav>

            {/* 4. Bottom Section (e.g., Theme Toggle) */}
            <div className="mt-auto border-t border-border p-4 shrink-0">
                 <div className="flex items-center justify-center gap-2">
                    <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('light')}>
                        <Sun className="h-4 w-4 mr-1" /> Light
                    </Button>
                    <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('dark')}>
                        <Moon className="h-4 w-4 mr-1" /> Dark
                    </Button>
                 </div>
                {/* Add other items like settings link or logout if needed */}
            </div>
        </aside>
    );
}

export default SuperAdminSidebar;
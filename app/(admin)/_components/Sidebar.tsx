"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "./NavItems";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <div className="relative flex h-screen">
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-20 bg-background/80 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "relative z-30 flex h-full flex-col bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo/Name Section */}
        <div className="flex items-center px-3 h-16 border-b border-border">
          {isCollapsed ? (
            <span className="mx-auto text-xl font-bold text-primary">A</span>
          ) : (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Admin</span>
            </Link>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ring-1 ring-border"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Sidebar Content */}
        <div className="select-scroll flex h-full flex-col overflow-y-auto py-8">
          <div className="space-y-2 px-3">
            {navigation.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    openDropdown === item.label
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon && (
                      <item.icon
                        className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "")}
                      />
                    )}
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed &&
                    (openDropdown === item.label ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </button>

                {/* Dropdown Links */}
                {openDropdown === item.label && !isCollapsed && (
                  <div className="mt-1 space-y-1 px-3">
                    {item.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "block rounded-md px-8 py-2 text-sm transition-colors",
                          pathname === link.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

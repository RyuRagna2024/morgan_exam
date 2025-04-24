// app/(admin)/_components/Sidebar.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "./NavItems"; // Your admin nav items
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col",
        "border-r border-border bg-card text-card-foreground",
        "transition-all duration-300 relative z-30",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Sidebar Toggle Button */}
      <button
        type="button"
        onClick={toggleCollapse}
        className={cn(
          "absolute z-50 flex h-6 w-6 items-center justify-center rounded-full",
          "top-5",
          isCollapsed ? "left-full -translate-x-1/2" : "-right-3",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "ring-2 ring-background",
          "transition-all duration-300",
        )}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo/Name Section */}
      <div className="flex h-16 items-center border-b border-border px-4 shrink-0 overflow-hidden">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-semibold text-lg text-foreground"
        >
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
            A
          </div>
          {!isCollapsed && <span className="truncate">Admin Panel</span>}
        </Link>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <div key={item.label}>
              <button
                type="button"
                onClick={() =>
                  !isCollapsed &&
                  item.links &&
                  item.links.length > 0 &&
                  toggleDropdown(item.label)
                }
                disabled={isCollapsed && item.links && item.links.length > 0}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  "text-muted-foreground hover:text-primary hover:bg-primary/10",
                  (openDropdown === item.label ||
                    (item.links &&
                      item.links.some((link) =>
                        pathname.startsWith(link.href),
                      ))) &&
                    !isCollapsed
                    ? "text-primary font-medium"
                    : "",
                  isCollapsed ? "justify-center" : "justify-between",
                )}
                // Use ternary operator for explicit string value for aria-expanded
                aria-expanded={
                  !isCollapsed && openDropdown === item.label ? "true" : "false"
                }
                aria-controls={`admin-dropdown-${item.label}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
                {!isCollapsed &&
                  item.links &&
                  item.links.length > 0 &&
                  (openDropdown === item.label ? (
                    <ChevronUp className="h-4 w-4 transition-transform duration-200 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 flex-shrink-0" />
                  ))}
              </button>

              {/* Dropdown Links */}
              {!isCollapsed &&
                openDropdown === item.label &&
                item.links &&
                item.links.length > 0 && (
                  <div
                    id={`admin-dropdown-${item.label}`}
                    className="mt-1 space-y-1 pl-7 pr-3"
                  >
                    {item.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-colors truncate",
                          pathname === link.href ||
                            pathname.startsWith(link.href + "/")
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
        </nav>
      </div>

      {/* Theme Toggle */}
      <div
        className={cn(
          "mt-auto border-t border-border p-4 shrink-0",
          isCollapsed
            ? "flex justify-center"
            : "flex items-center justify-center gap-2",
        )}
      >
        <Button
          type="button"
          variant={theme === "light" ? "secondary" : "ghost"}
          size={isCollapsed ? "icon" : "sm"}
          onClick={() => setTheme("light")}
          aria-label="Switch to light theme"
        >
          <Sun className="h-4 w-4" /> {!isCollapsed && "Light"}
        </Button>
        <Button
          type="button"
          variant={theme === "dark" ? "secondary" : "ghost"}
          size={isCollapsed ? "icon" : "sm"}
          onClick={() => setTheme("dark")}
          aria-label="Switch to dark theme"
        >
          <Moon className="h-4 w-4" /> {!isCollapsed && "Dark"}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

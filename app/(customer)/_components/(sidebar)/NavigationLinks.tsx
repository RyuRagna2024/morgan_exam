// src/components/customer/(sidebar)/NavigationLinks.tsx (Adjust path if needed)

import Link from "next/link";
import {
  ShoppingBag,
  User as UserIcon,
  Heart,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { usePathname } from "next/navigation"; // Import usePathname
import { cn } from "@/lib/utils"; // Import cn if not already

interface NavigationLinksProps {
  isCollapsed: boolean;
  // Removed currentPath prop, will get it from usePathname
}

export default function NavigationLinks({ isCollapsed }: NavigationLinksProps) {
  const currentPath = usePathname(); // Get current path using the hook

  // Helper function to determine if a link is active
  const isActive = (href: string) => {
    if (!currentPath) return false;
    return href === "/" ? currentPath === "/" : currentPath.startsWith(href);
  };

  const navItems = [
    { href: "/", icon: UserIcon, label: "Go To Home", tooltipLabel: "Home" }, // Changed tooltip
    { href: "/customer/orders", icon: ShoppingBag, label: "My Orders" },
    { href: "/customer/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/customer/subscriptions", icon: Calendar, label: "Subscriptions" },
    {
      href: "/customer/payment-methods",
      icon: CreditCard,
      label: "Payment Methods",
    },
    { href: "/customer/support", icon: HelpCircle, label: "Support" },
    { href: "/customer/mymessages", icon: MessageSquare, label: "My Messages" },
    { href: "/customer/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="py-4">
      <ul>
        {navItems.map((item) => {
          if (!item.icon) return null; // Skip item if icon is missing

          const active = isActive(item.href);
          const Icon = item.icon;
          const tooltipLabel = item.tooltipLabel || item.label;

          return (
            <li key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  // --- Base styles ---
                  "flex items-center py-3 transition duration-150 ease-in-out",
                  // --- Dynamic padding ---
                  isCollapsed ? "justify-center px-0" : "px-6",
                  // --- Text color (CRUCIAL for dark mode) ---
                  "text-gray-600 dark:text-gray-400", // Default text color
                  // --- Hover styles ---
                  "hover:bg-gray-100 dark:hover:bg-gray-700", // Hover background
                  "hover:text-gray-900 dark:hover:text-gray-100", // Hover text color
                  // --- Active styles ---
                  active && "bg-gray-100 dark:bg-gray-700", // Active background
                  active && "text-teal-600 dark:text-teal-400", // Active text color
                  active && "border-l-4 border-teal-500 dark:border-teal-400", // Active border
                  !active && "border-l-4 border-transparent", // Inactive border alignment
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 transition-colors duration-150 ease-in-out",
                    isCollapsed ? "" : "mr-3",
                    // --- Icon Color - Inherit from link or set explicitly ---
                    active
                      ? "text-teal-500 dark:text-teal-400"
                      : "text-gray-500 dark:text-gray-500", // Match link active/inactive or use subtle gray
                    // Add hover state for icon if desired
                    "group-hover:text-gray-700 dark:group-hover:text-gray-300",
                  )}
                  size={20}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {/* Tooltip styling */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200 rounded text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20">
                    {tooltipLabel}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

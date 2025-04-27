// app/(customer)/_components/(sidebar)/NavigationLinks.tsx (Adjust path if needed)

import Link from "next/link";
import {
  ShoppingBag,
  // User as UserIcon, // <<< REMOVE UserIcon import
  Heart,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  MessageSquare,
  LayoutDashboard, // <<< ADD LayoutDashboard import
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationLinksProps {
  isCollapsed: boolean;
}

export default function NavigationLinks({ isCollapsed }: NavigationLinksProps) {
  const currentPath = usePathname();

  // Helper function to determine if a link is active
  // Modified for dashboard: requires exact match for /customer
  const isActive = (href: string) => {
    if (!currentPath) return false;
    if (href === "/customer") {
      // Active only if the path IS exactly /customer
      return currentPath === "/customer";
    }
    // For other links, active if path starts with the href
    return currentPath.startsWith(href);
  };

  const navItems = [
    // --- MODIFIED THIS ITEM ---
    {
      href: "/customer", // Changed link
      icon: LayoutDashboard, // Changed icon
      label: "Dashboard", // Changed label
      tooltipLabel: "Dashboard", // Changed tooltip
    },
    // --- END MODIFICATION ---
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
          if (!item.icon) return null;

          const active = isActive(item.href);
          const Icon = item.icon;
          const tooltipLabel = item.tooltipLabel || item.label;

          return (
            <li key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center py-3 transition duration-150 ease-in-out",
                  isCollapsed ? "justify-center px-0" : "px-6",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  "hover:text-gray-900 dark:hover:text-gray-100",
                  active && "bg-gray-100 dark:bg-gray-700",
                  active && "text-teal-600 dark:text-teal-400",
                  active && "border-l-4 border-teal-500 dark:border-teal-400",
                  !active && "border-l-4 border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 transition-colors duration-150 ease-in-out",
                    isCollapsed ? "" : "mr-3",
                    active
                      ? "text-teal-500 dark:text-teal-400"
                      : "text-gray-500 dark:text-gray-500",
                    "group-hover:text-gray-700 dark:group-hover:text-gray-300",
                  )}
                  size={20}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
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

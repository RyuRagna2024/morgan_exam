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
  MessageSquare, // Import the icon for "My Messages"
} from "lucide-react";

// Update the interface to include currentPath
interface NavigationLinksProps {
  isCollapsed: boolean;
  currentPath?: string; // Make it optional for backward compatibility
}

export default function NavigationLinks({
  isCollapsed,
  currentPath = "",
}: NavigationLinksProps) {
  // Helper function to determine if a link is active
  const isActive = (href: string) => {
    if (!currentPath) return false;
    // Check if currentPath starts with href to handle nested routes
    // For home path, do an exact match to avoid highlighting home for all routes
    return href === "/" ? currentPath === "/" : currentPath.startsWith(href);
  };

  // Navigation items array for cleaner code and easier maintenance
  const navItems = [
    {
      href: "/",
      icon: UserIcon,
      label: "Go To Home",
      tooltipLabel: "My Account",
    },
    { href: "/customer/orders", icon: ShoppingBag, label: "My Orders" },
    { href: "/customer/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/customer/subscriptions", icon: Calendar, label: "Subscriptions" },
    {
      href: "/customer/payment-methods",
      icon: CreditCard,
      label: "Payment Methods",
    },
    // Existing Support link
    { href: "/customer/support", icon: HelpCircle, label: "Support" },
    // --- Add the new "My Messages" link here ---
    { href: "/customer/mymessages", icon: MessageSquare, label: "My Messages" },
    // --- End of new link ---
    // Settings item now comes after "My Messages"
    { href: "/customer/settings", icon: Settings, label: "Settings" },
  ];
  // --- End of Modified navItems array ---

  return (
    <nav className="py-4">
      <ul>
        {navItems.map((item) => {
          // Ensure item.icon exists before trying to render it
          if (!item.icon) {
            console.warn(
              `Navigation item with label "${item.label}" is missing an icon.`,
            );
            return null; // Skip rendering this item if icon is missing
          }
          const active = isActive(item.href);
          const Icon = item.icon; // Assign here after the check
          const tooltipLabel = item.tooltipLabel || item.label;

          return (
            <li key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center py-3 ${
                  isCollapsed ? "justify-center px-0" : "px-6"
                } hover:bg-slate-600 transition ${
                  active
                    ? "bg-slate-600 border-l-4 border-teal-500"
                    : "border-l-4 border-transparent" // Add transparent border for consistent alignment
                }`}
              >
                <Icon // Now Icon is guaranteed to be a component
                  className={`${isCollapsed ? "" : "mr-3"} flex-shrink-0`} // Added flex-shrink-0
                  size={20}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span> // Added truncate
                )}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 rounded text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20">
                    {" "}
                    {/* Adjusted tooltip positioning and added z-index */}
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

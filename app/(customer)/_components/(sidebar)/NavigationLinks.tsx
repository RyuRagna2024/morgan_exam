import Link from "next/link";
import {
  ShoppingBag,
  User as UserIcon,
  Heart,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
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
    { href: "/customer/settings", icon: Settings, label: "Settings" },
    { href: "/customer/support", icon: HelpCircle, label: "Support" },
  ];

  return (
    <nav className="py-4">
      <ul>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const tooltipLabel = item.tooltipLabel || item.label;

          return (
            <li key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center py-3 ${
                  isCollapsed ? "justify-center px-0" : "px-6"
                } hover:bg-slate-600 transition ${
                  active ? "bg-slate-600 border-l-4 border-teal-500" : ""
                }`}
              >
                <Icon className={isCollapsed ? "" : "mr-3"} size={20} />
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 rounded text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
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

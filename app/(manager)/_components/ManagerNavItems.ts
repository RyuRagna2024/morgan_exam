// app/(manager)/_components/ManagerNavItems.ts
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  ShoppingCart,
  LucideIcon, // Import LucideIcon type for defining icon types
} from "lucide-react";

// Define the type for a single navigation link
export interface ManagerNavLink {
  name: string;
  href: string;
}

// Define the type for a top-level navigation item
export interface ManagerNavigationItem {
  label: string;
  icon: LucideIcon; // Use the imported type
  href: string; // Add href directly for top-level links
  // links?: ManagerNavLink[]; // Keep for potential future dropdowns
}

// Define the actual navigation structure for the Manager
export const managerNavigation: ManagerNavigationItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/manager",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/manager/reports",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/manager/orders",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/manager/settings",
  },
  // Add more top-level items or items with nested links later if needed
  // Example with nested links (if you need dropdowns later):
  // {
  //   label: "Products",
  //   icon: Package,
  //   href: "#", // Top level might not link directly
  //   links: [
  //     { name: "View Products", href: "/manager/products" },
  //     { name: "Categories", href: "/manager/categories" },
  //   ],
  // },
];

import { NavItem } from "@/types/navigation";
import {
  Settings,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  MessageSquare, // Icon for Support tickets (optional, choose any)
} from "lucide-react";

/**
 * Defines the structure for the admin sidebar navigation.
 * Each top-level object represents a collapsible section.
 */
export const navigation: NavItem[] = [
  {
    label: "App Users",
    icon: Users, // Icon for the section header
    links: [
      // Links within the App Users section
      { name: "Access Control", href: "/admin/users/access" },
    ],
  },
  {
    label: "Products",
    icon: ShoppingCart,
    links: [
      { name: "Create", href: "/admin/products/create" },
      { name: "Update", href: "/admin/products/update" },
      { name: "Collections", href: "/admin/products/collections" },
    ],
  },
  {
    label: "Customers",
    icon: Users, // Icon for the Customers section header
    links: [
      { name: "Orders", href: "/admin/customers/orders" },
      { name: "Overview", href: "/admin/customers/overview" },
      { name: "Management", href: "/admin/customers/management" },
      { name: "Analytics", href: "/admin/customers/analytics" },
      // --- Added Support Link ---
      { name: "Support", href: "/admin/customers/support" },
      // --- End of Added Link ---
    ],
  },
  {
    label: "Reports",
    icon: FileText,
    links: [
      { name: "Sales", href: "/admin/reports/sales" },
      { name: "Inventory", href: "/admin/reports/inventory" },
      { name: "Performance", href: "/admin/reports/performance" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    links: [
      { name: "Dashboard", href: "/admin/analytics/dashboard" },
      { name: "Metrics", href: "/admin/analytics/metrics" },
      { name: "Forecasts", href: "/admin/analytics/forecasts" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    links: [
      { name: "General", href: "/admin/settings/general" },
      { name: "Security", href: "/admin/settings/security" },
      { name: "Preferences", href: "/admin/settings/preferences" },
    ],
  },
];

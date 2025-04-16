import React from "react"; // Import React if using ComponentType

// Define the type for a single link within a dropdown
type NavLink = {
  name: string;
  href: string;
};

// Define the type for a top-level navigation item (section)
export type NavItem = {
  label: string;
  // The icon is optional and expects a React component type
  icon?: React.ComponentType<{ className?: string }>;
  // links is an array of NavLink objects
  links: NavLink[];
};

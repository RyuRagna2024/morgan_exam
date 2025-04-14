export interface Route {
  name: string;
  path: string;
}

export const getRoutes = (isLoggedIn = false): Route[] => {
  const baseRoutes: Route[] = [
    { name: "Home", path: "/" },
    { name: "Headwear", path: "/headwear" },
    { name: "Apparel", path: "/apparel" },
    { name: "All Collections", path: "/all-collections" },
  ];

  // Only add the dashboard route if the user is logged in
  if (isLoggedIn) {
    baseRoutes.push({ name: "My Dashboard", path: "/customer" });
  }

  return baseRoutes;
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  routes: { name: string; path: string }[];
  dashboardUrl?: string;
}

const MobileMenu = ({
  isOpen,
  onClose,
  menuRef,
  routes,
  dashboardUrl = "/customer",
}: MobileMenuProps) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();

    // Check if we're already on the dashboard page
    if (pathname === dashboardUrl) {
      // If already on dashboard, perform a hard window reload
      window.location.reload();
    } else {
      // If coming from a different page, navigate to dashboard with hard navigation
      window.location.href = dashboardUrl;
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-b from-gray-900 to-black border-l border-red-700 shadow-lg z-50 transition-transform duration-300 ease-in-out"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex flex-col gap-4 mt-8">
          {routes.map((route) =>
            route.name === "My Dashboard" ? (
              <a
                key={route.path}
                href={dashboardUrl}
                onClick={handleDashboardClick}
                className="px-4 py-3 rounded-md text-gray-300 transition-all duration-300
                  hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700"
              >
                {route.name}
              </a>
            ) : (
              <Link
                key={route.path}
                href={route.path}
                onClick={onClose}
                className="px-4 py-3 rounded-md text-gray-300 transition-all duration-300
                  hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700"
              >
                {route.name}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

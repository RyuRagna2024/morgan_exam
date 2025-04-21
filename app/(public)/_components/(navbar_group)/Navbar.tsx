// app/(public)/_components/(navbar_group)/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useSession } from "@/app/SessionProvider";
import UserButton from "../UserButton";
import TierBadge from "./TierBadge";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { useState, useEffect, useRef } from "react";

// Assuming these imports are correct based on your structure
import Cart from "./(cart)/Cart";
import MobileMenu from "./MobileMenu"; // Import MobileMenu
import { MenuIcon, CartIcon } from "./NavIcons";
import { getRoutes } from "./routes";
import AuthModal from "@/app/(auth)/_components/AuthTabs";
import { useCart } from "../../productId/cart/_store/use-cart-store-hooks";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useSession();
  const { itemCount } = useCart(); // Assuming this provides a number

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const cartMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // ... scroll and click outside handlers ...
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        !mobileMenuRef.current?.contains(event.target as Node) &&
        !mobileMenuButtonRef.current?.contains(event.target as Node)
      )
        setMobileMenuOpen(false);
      if (
        cartOpen &&
        !cartMenuRef.current?.contains(event.target as Node) &&
        !cartButtonRef.current?.contains(event.target as Node)
      )
        setCartOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen, cartOpen]);

  // Get routes based on user authentication status
  const routes = getRoutes(!!user); // Assuming this returns the correct route objects

  // Determine Dashboard Path
  // --- Initialize dashboardPath as undefined ---
  let dashboardPath: string | undefined = undefined; // Use undefined instead of null
  let showDashboardLink = false;
  // --- End Initialization Change ---

  if (user) {
    showDashboardLink = true; // Assume we show it unless specified otherwise
    switch (user.role) {
      case UserRole.EDITOR:
        dashboardPath = "/editor";
        break;
      case UserRole.CUSTOMER:
      case UserRole.PROCUSTOMER:
        dashboardPath = "/customer";
        break;
      case UserRole.MANAGER:
        dashboardPath = "/manager";
        break;
      case UserRole.ADMIN:
        dashboardPath = "/admin";
        break;
      case UserRole.SUPERADMIN:
        dashboardPath = "/super-admin";
        break;
      case UserRole.USER:
      default:
        // Don't assign dashboardPath, leave it undefined
        showDashboardLink = false;
        break;
    }
  } else {
    showDashboardLink = false; // Also hide if not logged in
  }

  // Click handler for dashboard link (optional, Link might be enough)
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dashboardPath) {
      router.push(dashboardPath);
    }
  };

  return (
    <header /* ... className ... */>
      <nav className="container mx-auto px-7 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo_gh.png"
            alt="Genius Humans Logo"
            width={250}
            height={45}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {routes.map((route) => {
            if (route.name === "My Dashboard") {
              // Only render if showDashboardLink is true and dashboardPath is a string
              return showDashboardLink && dashboardPath ? (
                <Link // Use Link directly here for consistency
                  key={route.path}
                  href={dashboardPath}
                  className="px-4 py-2 rounded-md text-gray-300 transition-all duration-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:scale-105 font-medium"
                >
                  {route.name}
                </Link>
              ) : null; // Render nothing if link shouldn't be shown
            }
            // Render other routes
            return (
              <Link
                key={route.path}
                href={route.path}
                className="px-4 py-2 rounded-md text-gray-300 transition-all duration-300 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:scale-105 font-medium"
              >
                {route.name}
              </Link>
            );
          })}
          {/* Cart Icon */}
          {user &&
            (user.role === UserRole.CUSTOMER ||
              user.role === UserRole.PROCUSTOMER) && (
              <div className="relative">
                {" "}
                <button
                  ref={cartButtonRef}
                  onClick={() => setCartOpen(!cartOpen)} /* ... */
                >
                  {" "}
                  <CartIcon />{" "}
                  {itemCount > 0 && (
                    <span /* ... */>{itemCount > 99 ? "99+" : itemCount}</span>
                  )}{" "}
                </button>{" "}
              </div>
            )}
          {/* Auth Button */}
          <div className="ml-2 text-gray-300 flex items-center gap-2 relative">
            {!user ? (
              <AuthModal />
            ) : (
              <>
                {" "}
                <UserButton />{" "}
                <div className="absolute -bottom-1 -right-1 z-10">
                  {" "}
                  <TierBadge />{" "}
                </div>{" "}
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Cart Icon */}
          {user &&
            (user.role === UserRole.CUSTOMER ||
              user.role === UserRole.PROCUSTOMER) && (
              <div className="relative">
                {" "}
                <button
                  ref={cartButtonRef}
                  onClick={() => setCartOpen(!cartOpen)} /* ... */
                >
                  {" "}
                  <CartIcon />{" "}
                  {itemCount > 0 && (
                    <span /* ... */>{itemCount > 99 ? "99+" : itemCount}</span>
                  )}{" "}
                </button>{" "}
              </div>
            )}
          {/* Mobile Auth Button */}
          <div className="text-gray-300 flex items-center gap-2 relative">
            {!user ? (
              <AuthModal />
            ) : (
              <>
                {" "}
                <UserButton />{" "}
                <div className="absolute -bottom-1 -right-1 z-10">
                  {" "}
                  <TierBadge />{" "}
                </div>{" "}
              </>
            )}
          </div>
          {/* Mobile Menu Trigger */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} /* ... */
          >
            {" "}
            <MenuIcon />{" "}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Component - Pass dashboardPath (which is string | undefined) */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuRef={mobileMenuRef}
        routes={routes}
        dashboardUrl={dashboardPath} // Pass the variable directly
      />

      {/* Global Cart */}
      {user &&
        (user.role === UserRole.CUSTOMER ||
          user.role === UserRole.PROCUSTOMER) && (
          <Cart
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cartRef={cartMenuRef}
          />
        )}
    </header>
  );
};

// Helper NavLink component (keep or remove based on preference)
// const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => ( ... );

export default Navbar;

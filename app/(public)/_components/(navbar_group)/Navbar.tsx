// app/(public)/_components/(navbar_group)/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/app/SessionProvider"; // Root SessionProvider
import UserButton from "../UserButton"; // Your UserButton component
import TierBadge from "./TierBadge";
import { UserRole } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react"; // Import useState, useEffect

import Cart from "./(cart)/Cart"; // Your Cart component
import MobileMenu from "./MobileMenu"; // Your MobileMenu component
// Import ALL icons needed
import {
  MenuIcon,
  CartIcon,
  SearchIcon,
  UserIcon,
  Sun,
  Moon,
} from "./NavIcons";
import { getRoutes } from "./routes";
import AuthModal from "@/app/(auth)/_components/AuthTabs"; // Your AuthModal component
import { useCart } from "../../productId/cart/_store/use-cart-store-hooks"; // Cart store hook
import { cn } from "@/lib/utils"; // Import cn utility
import { useTheme } from "next-themes"; // Import useTheme

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useSession(); // Use the hook from app/SessionProvider
  const { itemCount } = useCart();
  const { theme, setTheme } = useTheme(); // Get theme state and setter
  const [mounted, setMounted] = useState(false); // State to track client mount

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const cartMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  // Effect to set mounted state (for theme toggle hydration safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll and Click Outside Logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
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

  // Routes and Dashboard Logic
  const routes = getRoutes(!!user);
  let dashboardPath: string | undefined = undefined;
  let showDashboardLink = false;

  if (user) {
    showDashboardLink = true;
    switch (user.role) {
      case UserRole.EDITOR:
        dashboardPath = "/editor";
        break;
      case UserRole.PROCUSTOMER:
        dashboardPath = "/customer-pro";
        break; // Double-check this path exists
      case UserRole.CUSTOMER:
        dashboardPath = "/customer";
        break;
      case UserRole.MANAGER:
        dashboardPath = "/manager";
        break;
      case UserRole.ADMIN:
        dashboardPath = "/admin";
        break;
      case UserRole.SUPERADMIN:
        dashboardPath = "/admin-super";
        break; // Match folder name '/admin-super'
      case UserRole.USER:
      default:
        showDashboardLink = false;
        break;
    }
  } else {
    showDashboardLink = false;
  }

  // Mobile Dashboard Click Handler
  const handleDashboardClickMobile = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (dashboardPath) {
      if (pathname === dashboardPath) {
        window.location.reload();
      } else {
        router.push(dashboardPath); // Use client-side navigation
      }
    }
  };

  // Theme Toggle Function
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Helper to render the theme toggle button (avoids hydration mismatch)
  const renderThemeToggleButton = () => {
    if (!mounted) {
      // Render a placeholder to prevent layout shift
      return (
        <div
          className="p-1 w-[calc(1.25rem+0.5rem)] h-[calc(1.25rem+0.5rem)]"
          aria-hidden="true"
        />
      );
    }
    return (
      <button
        onClick={toggleTheme}
        className="text-muted-foreground hover:text-foreground relative transition-colors p-1 rounded-full hover:bg-accent"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {/* Show icon for the mode you will switch TO */}
        {theme === "dark" ? (
          <Sun /> // <-- Remove className here
        ) : (
          <Moon /> // <-- Remove className here
        )}
      </button>
    );
  };

  return (
    <header
      // Sticky header with dark theme styles
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300 ease-in-out",
        scrolled
          ? "bg-background/90 backdrop-blur-sm border-b border-border shadow-lg shadow-black/20"
          : "bg-background border-b border-transparent",
      )}
    >
      {/* Container with new height and padding */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {" "}
        {/* Reduced height */}
        {/* Left Side: Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="flex items-center"
            aria-label="Go to homepage"
          >
            <Image
              src="/logo_gh.png" // Your logo
              alt="Genius Humans Logo"
              width={180} // Adjust as needed
              height={35} // Adjust as needed
              className="object-contain"
              priority
            />
          </Link>
        </div>
        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex flex-grow items-center justify-center gap-2 lg:gap-4">
          {" "}
          {/* Reduced gap */}
          {routes.map((route) => {
            // Skip dashboard link here
            if (route.name === "My Dashboard") return null;

            return (
              <Link
                key={route.path}
                href={route.path}
                // Dark theme link styles using theme variables
                className={cn(
                  "text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-md",
                  pathname === route.path
                    ? "text-primary-foreground bg-primary" // Active style
                    : "text-muted-foreground hover:text-foreground hover:bg-accent", // Default style
                )}
              >
                {route.name}
              </Link>
            );
          })}
          {/* Optional: Add Dashboard link explicitly in the center if needed */}
          {/* {showDashboardLink && dashboardPath && (<Link... />)} */}
        </div>
        {/* Right Side: Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {" "}
          {/* Adjusted gap */}
          {/* Search Icon (Optional) */}
          {/*
          <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
            <SearchIcon />
          </button>
          */}
          {/* THEME TOGGLE BUTTON - DESKTOP */}
          {renderThemeToggleButton()}
          {/* Cart Icon */}
          {user &&
            (user.role === UserRole.CUSTOMER ||
              user.role === UserRole.PROCUSTOMER) && (
              <div className="relative">
                <button
                  ref={cartButtonRef}
                  onClick={() => setCartOpen(!cartOpen)}
                  className="text-muted-foreground hover:text-foreground relative transition-colors p-1" // Added padding
                  aria-label={`Open cart with ${itemCount} items`}
                >
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span> // Slightly smaller badge
                  )}
                </button>
              </div>
            )}
          {/* Auth / User Section */}
          <div className="flex items-center gap-2 relative">
            {!user ? (
              // Render AuthModal directly (it has its own trigger)
              <AuthModal />
            ) : (
              // Render UserButton (Avatar + Dropdown) and TierBadge
              <div className="flex items-center gap-2">
                <UserButton />
                <div className="relative -bottom-4 -right-3 z-10">
                  {" "}
                  {/* Adjust positioning as needed */}
                  <TierBadge />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Right Side: Actions (Mobile) */}
        <div className="md:hidden flex items-center gap-1">
          {" "}
          {/* Adjusted gap */}
          {/* THEME TOGGLE BUTTON - MOBILE */}
          {renderThemeToggleButton()}
          {/* Mobile Cart Icon */}
          {user &&
            (user.role === UserRole.CUSTOMER ||
              user.role === UserRole.PROCUSTOMER) && (
              <div className="relative">
                <button
                  ref={cartButtonRef}
                  onClick={() => setCartOpen(!cartOpen)}
                  className="text-muted-foreground hover:text-foreground relative transition-colors p-1"
                  aria-label={`Open cart with ${itemCount} items`}
                >
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          {/* Mobile Auth Trigger / User Button */}
          {!user ? <AuthModal /> : <UserButton />}
          {/* Mobile Menu Trigger */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuRef={mobileMenuRef}
        routes={routes}
        dashboardUrl={dashboardPath}
        onDashboardClick={handleDashboardClickMobile}
      />

      {/* Global Cart Component */}
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

export default Navbar;

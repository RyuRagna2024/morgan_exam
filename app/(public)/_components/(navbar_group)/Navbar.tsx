// app/(public)/_components/(navbar_group)/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/app/SessionProvider";
import UserButton from "../UserButton"; // *** UNCOMMENTED ***
import TierBadge from "./TierBadge"; // *** UNCOMMENTED ***
import { UserRole } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation"; // Restore router/pathname
import { useState, useEffect, useRef } from "react";
import Cart from "./(cart)/Cart"; // Restore Cart
import MobileMenu from "./MobileMenu"; // Restore MobileMenu
import {
  MenuIcon,
  CartIcon,
  SearchIcon,
  UserIcon,
  Sun,
  Moon,
} from "./NavIcons";
import { getRoutes } from "./routes";
import AuthTabs from "@/app/(auth)/_components/AuthTabs"; // Use AuthTabs (original reverted state)
import { useCart } from "../../productId/cart/_store/use-cart-store-hooks"; // Restore useCart
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
// import { Dialog, DialogContent } from "@/components/ui/dialog"; // Remove Dialog imports (handled by AuthTabs)
import { Button } from "@/components/ui/button"; // Keep Button import

const Navbar = () => {
  const pathname = usePathname(); // Restore
  const router = useRouter(); // Restore
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Restore state
  const [cartOpen, setCartOpen] = useState(false); // Restore state
  const { user } = useSession();
  const { itemCount } = useCart(); // Restore hook call
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Remove state for manually controlled dialog
  // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Restore Refs
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const cartMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Restore full click outside logic
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
  }, [cartOpen, mobileMenuOpen]); // Restore dependencies

  const routes = getRoutes(!!user);
  // Restore dashboard logic
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
        break;
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
        break;
      case UserRole.USER:
      default:
        showDashboardLink = false;
        break;
    }
  } else {
    showDashboardLink = false;
  }

  // Restore mobile dashboard handler
  const handleDashboardClickMobile = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (dashboardPath) {
      if (pathname === dashboardPath) {
        window.location.reload();
      } else {
        router.push(dashboardPath);
      }
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const renderThemeToggleButton = () => {
    if (!mounted) {
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
        {" "}
        {theme === "dark" ? <Sun /> : <Moon />}{" "}
      </button>
    );
  };

  return (
    // Removed Fragment wrapper as Dialog is handled internally now
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300 ease-in-out",
        scrolled
          ? "bg-background/90 backdrop-blur-sm border-b border-border shadow-lg shadow-black/20"
          : "bg-background border-b border-transparent",
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left Logo */}
        <div className="flex-shrink-0">
          <Link href="/" aria-label="Go to homepage">
            {" "}
            <Image
              src="/logo_gh.png"
              alt="Genius Humans Logo"
              width={180}
              height={35}
              className="object-contain"
              priority
            />{" "}
          </Link>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex flex-grow items-center justify-center gap-2 lg:gap-4">
          {/* Original mapping logic (without Dashboard link handled here) */}
          {routes.map((route) => {
            if (route.name === "My Dashboard") return null;
            return (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-md",
                  pathname === route.path
                    ? "text-primary-foreground bg-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {" "}
                {route.name}{" "}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {/* Dashboard Link */}
          {showDashboardLink && dashboardPath && (
            <Link
              key="dashboard-action-link"
              href={dashboardPath}
              className={cn(
                "text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-md",
                pathname === dashboardPath
                  ? "text-primary-foreground bg-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {" "}
              My Dashboard{" "}
            </Link>
          )}
          {/* Theme Toggle Button */}
          {renderThemeToggleButton()}
          {/* Cart Icon */}
          {user &&
            (user.role === UserRole.CUSTOMER ||
              user.role === UserRole.PROCUSTOMER) && (
              <div className="relative">
                <button
                  ref={cartButtonRef}
                  onClick={() => setCartOpen(true)}
                  className="text-muted-foreground hover:text-foreground relative transition-colors p-1"
                  aria-label={`Open cart with ${itemCount} items`}
                >
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                      {" "}
                      {itemCount > 99 ? "99+" : itemCount}{" "}
                    </span>
                  )}
                </button>
              </div>
            )}
          {/* Auth / User Section */}
          <div className="flex items-center gap-2">
            {" "}
            {/* Outer container */}
            {!user ? (
              <AuthTabs /> // Use original AuthTabs component
            ) : (
              // *** Corrected Structure for User + Badge ***
              <div className="relative flex-shrink-0">
                {" "}
                {/* Wrap UserButton and Badge in a relative container */}
                <UserButton />
                {/* Position Badge absolutely relative to the container */}
                <div className="absolute -bottom-1 -right-1 z-10">
                  <TierBadge />
                </div>
              </div>
              // *** End Corrected Structure ***
            )}
          </div>
        </div>

        {/* Right Side: Actions (Mobile) */}
        <div className="md:hidden flex items-center gap-1">
          {renderThemeToggleButton()}
          {/* Cart Icon */}
          {user &&
            (user.role === UserRole.CUSTOMER ||
              user.role === UserRole.PROCUSTOMER) && (
              <div className="relative">
                <button
                  ref={cartButtonRef}
                  onClick={() => setCartOpen(true)}
                  className="text-muted-foreground hover:text-foreground relative transition-colors p-1"
                  aria-label={`Open cart with ${itemCount} items`}
                >
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                      {" "}
                      {itemCount > 99 ? "99+" : itemCount}{" "}
                    </span>
                  )}
                </button>
              </div>
            )}
          {/* Auth / User */}
          {!user ? (
            <AuthTabs /> // Use original AuthTabs
          ) : (
            // *** Corrected Structure for User + Badge (Mobile) ***
            <div className="relative flex-shrink-0">
              {" "}
              {/* Wrap UserButton and Badge */}
              <UserButton />
              {/* Position Badge absolutely */}
              <div className="absolute -bottom-1 -right-1 z-10">
                <TierBadge />
              </div>
            </div>
            // *** End Corrected Structure ***
          )}
          {/* Mobile Menu Trigger */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Open menu"
          >
            {" "}
            <MenuIcon />{" "}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Component */}
      {/* Restore props */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuRef={mobileMenuRef}
        routes={routes}
        dashboardUrl={dashboardPath}
        onDashboardClick={handleDashboardClickMobile}
      />

      {/* Cart Component */}
      {/* Restore props and conditional rendering */}
      {user &&
        (user.role === UserRole.CUSTOMER ||
          user.role === UserRole.PROCUSTOMER) && (
          <Cart
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cartRef={cartMenuRef}
          />
        )}

      {/* No separate Dialog needed as AuthTabs handles its own */}
    </header>
  );
};

export default Navbar;

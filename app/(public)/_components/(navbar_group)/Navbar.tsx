"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/app/SessionProvider";
import UserButton from "../UserButton";
import Cart from "./(cart)/Cart";
import MobileMenu from "./MobileMenu";
import { MenuIcon, CartIcon } from "./NavIcons";
import { getRoutes } from "./routes";
import AuthModal from "@/app/(auth)/_components/AuthTabs";
import { useCart } from "../../productId/cart/_store/use-cart-store-hooks";
import { usePathname } from "next/navigation";
import TierBadge from "./TierBadge"; // Import the TierBadge component

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useSession();
  const { itemCount } = useCart();

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const cartMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Close mobile menu if clicking outside
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }

      // Close cart menu if clicking outside
      if (
        cartOpen &&
        cartMenuRef.current &&
        !cartMenuRef.current.contains(event.target as Node) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target as Node)
      ) {
        setCartOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen, cartOpen]);

  // Get routes based on user authentication status
  const routes = getRoutes(!!user);

  // This function handles dashboard navigation with a hard refresh
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if we're already on the dashboard page
    if (pathname === "/customer") {
      // If already on dashboard, perform a hard window reload
      window.location.reload();
    } else {
      // If coming from a different page, navigate to dashboard with hard navigation
      window.location.href = "/customer";
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-b from-gray-900 to-black shadow-lg border-b border-red-700"
          : "bg-gradient-to-b from-gray-900 to-black"
      }`}
    >
      <nav className="container mx-auto px-7 flex items-center justify-between h-20">
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
          {routes.map((route) =>
            route.name === "My Dashboard" ? (
              <a
                key={route.path}
                href="/customer"
                onClick={handleDashboardClick}
                className="px-4 py-2 rounded-md text-gray-300 transition-all duration-300 
                  hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 
                  hover:scale-105 font-medium"
              >
                {route.name}
              </a>
            ) : (
              <Link
                key={route.path}
                href={route.path}
                className="px-4 py-2 rounded-md text-gray-300 transition-all duration-300 
                  hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 
                  hover:scale-105 font-medium"
              >
                {route.name}
              </Link>
            ),
          )}

          {/* Cart Icon for logged-in users - Desktop */}
          {user && (
            <div className="relative">
              <button
                ref={cartButtonRef}
                onClick={() => setCartOpen(!cartOpen)}
                className="ml-2 p-2 rounded-md text-gray-300 hover:text-white hover:bg-red-600/20"
                aria-label={`Open cart containing ${itemCount} items`}
              >
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="sr-only">Open cart</span>
              </button>
            </div>
          )}

          {/* Auth Button with Tier Badge */}
          <div className="ml-2 text-gray-300 flex items-center gap-2">
            {!user ? (
              <AuthModal />
            ) : (
              <>
                <UserButton />
                <TierBadge />
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {/* Cart Icon for logged-in users - Mobile */}
          {user && (
            <div className="relative">
              <button
                ref={cartButtonRef}
                onClick={() => setCartOpen(!cartOpen)}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-red-600/20"
                aria-label={`Open cart containing ${itemCount} items`}
              >
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
                <span className="sr-only">Open cart</span>
              </button>
            </div>
          )}

          {/* Auth Button with Tier Badge - Mobile */}
          <div className="text-gray-300 flex items-center gap-2">
            {!user ? (
              <AuthModal />
            ) : (
              <>
                <UserButton />
                <TierBadge />
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-red-600/20"
          >
            <MenuIcon />
            <span className="sr-only">Toggle menu</span>
          </button>

          {/* Mobile Menu Component */}
          <MobileMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            menuRef={mobileMenuRef}
            routes={routes}
            dashboardUrl="/customer"
          />
        </div>
      </nav>

      {/* Global Cart - will be shown for both mobile and desktop */}
      {user && (
        <Cart
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          cartRef={cartMenuRef}
        />
      )}
    </header>
  );
}

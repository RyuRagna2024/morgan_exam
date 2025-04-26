// app/(public)/_components/(footer)/Footer.tsx
import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import EmailSubscribe from "./EmailSubscribe"; // Ensure this is also theme-aware
import { cn } from "@/lib/utils";

const Footer: React.FC = () => {
  return (
    // Use theme background and border. Removed relative positioning unless needed for gradient border.
    <footer className="border-t border-border bg-background">
      {/* Optional Gradient top border (Keep if desired as accent) */}
      {/* <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700" /> */}

      {/* Main content area with reduced padding */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12">
          {/* Column 1: Company Info & Newsletter */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="space-y-3">
              {/* Use theme primary color for heading */}
              <h2 className="text-xl font-semibold text-primary">DevStyle</h2>
              {/* Use muted foreground for description */}
              <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
                Discover the perfect blend of technology and style. Shop the
                latest tech accessories that complement your lifestyle.
              </p>
            </div>
            {/* EmailSubscribe needs to be theme-aware too */}
            <EmailSubscribe />
          </div>

          {/* Group remaining columns */}
          <div className="w-full md:w-1/2 flex flex-col sm:flex-row justify-between gap-8 md:gap-6">
            {/* Column 2: Hours & Contact */}
            <div className="w-full sm:w-1/2 space-y-6">
              {/* Store Hours */}
              <div className="space-y-3">
                {/* Use theme foreground for headings */}
                <h3 className="text-base font-medium text-foreground">
                  Store Hours
                </h3>
                {/* Use muted foreground for details */}
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>Mon - Fri: 9am - 7pm</p>
                  <p>Saturday: 10am - 6pm</p>
                  <p>Sunday: 11am - 5pm</p>
                </div>
              </div>
              {/* Contact */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-foreground">
                  Contact
                </h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>+1 (555) 123-4567</p>
                  <p>support@devstyle.com</p>
                </div>
              </div>
            </div>

            {/* Column 3: Locations */}
            <div className="w-full sm:w-1/2 space-y-3">
              <h3 className="text-base font-medium text-foreground">
                Locations
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                {/* Location 1 */}
                <div className="space-y-1">
                  {/* Use theme foreground for emphasized text */}
                  <p className="font-medium text-foreground">Downtown Store</p>
                  <p>123 Tech Avenue</p>
                  <p>New York, NY 10001</p>
                </div>
                {/* Location 2 */}
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Mall Location</p>
                  <p>456 Shopping Center</p>
                  <p>Brooklyn, NY 11201</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Separator & Content */}
      {/* Use theme border */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright - Use muted foreground */}
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} DevStyle. All rights reserved.
            </div>

            {/* Links & Social Icons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Policy Links - Use muted foreground, hover with primary */}
              <div className="flex gap-4">
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </div>

              {/* Social Icons - Use muted foreground, hover with primary */}
              <div className="flex items-center gap-3">
                <Link
                  href="https://facebook.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="h-4 w-4" />
                </Link>
                <Link
                  href="https://instagram.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-4 w-4" />
                </Link>
                <Link
                  href="https://twitter.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <FaXTwitter className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

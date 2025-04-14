// components/Footer.tsx
import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import EmailSubscribe from "./EmailSubscribe";

const Footer: React.FC = () => {
  return (
    <footer className="relative">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />

      <div className="bg-gradient-to-b from-gray-900 to-black">
        <div className="mx-auto max-w-7xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 px-6 py-16">
            {/* Company Info & Newsletter */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-red-500">
                  TechStyle
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                  Discover the perfect blend of technology and style. Shop the
                  latest tech accessories that complement your lifestyle.
                </p>
              </div>

              <EmailSubscribe />
            </div>

            {/* Hours & Contact */}
            <div className="space-y-4">
              <h3 className="font-medium text-white">Store Hours</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Mon - Fri: 9am - 7pm</p>
                <p>Saturday: 10am - 6pm</p>
                <p>Sunday: 11am - 5pm</p>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-4 text-white">Contact</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>+1 (555) 123-4567</p>
                  <p>support@techstyle.com</p>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <h3 className="font-medium text-white">Locations</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <p className="font-medium text-white">Downtown Store</p>
                  <p>123 Tech Avenue</p>
                  <p>New York, NY 10001</p>
                </div>
                <div className="pt-2">
                  <p className="font-medium text-white">Mall Location</p>
                  <p>456 Shopping Center</p>
                  <p>Brooklyn, NY 11201</p>
                </div>
              </div>
            </div>
          </div>

          {/* Separator with gradient */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

          {/* Bottom Footer */}
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                © {new Date().getFullYear()} TechStyle. All rights reserved.
              </div>

              <div className="flex items-center gap-8">
                <div className="flex gap-6">
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-300 hover:text-red-500 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-300 hover:text-red-500 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    href="https://facebook.com"
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebookF className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://instagram.com"
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://twitter.com"
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// app/(public)/_components/(section-3)/ProductTabs.tsx
"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBestSellersContent } from "./_components/(best-seller)/BestSellers";
import { useOnSaleContent } from "./_components/(on-sale)/OnSale";
import { ProductSlide } from "./_components/ProductSlide";
import { useNewArrivalsContent } from "./_components/(new-arrivals)/NewArrivals";
// --- Use StoreItem type ---
import { StoreItem, Viewport, TabContent } from "./types";
import { useSession } from "@/app/SessionProvider"; // Use the ROOT session provider

// Removed ProductCardProps import as conversion happens in ProductSlide

const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSession(); // Get user from root session
  const userRole = user?.role ?? "USER"; // Determine user role, default to USER

  // Fetch content using hooks - these now return TabContent type
  const newArrivalsContent = useNewArrivalsContent();
  const bestSellersContent = useBestSellersContent();
  const onSaleContent = useOnSaleContent();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const tabs = [
    { name: "New Arrivals", id: 0, contentHook: newArrivalsContent },
    { name: "Best Sellers", id: 1, contentHook: bestSellersContent },
    { name: "On Sale", id: 2, contentHook: onSaleContent },
  ];

  // Function to get the correct content based on tab and viewport
  const getCurrentContent = (): (StoreItem | { isEmpty: true })[][] => {
    const viewport: Viewport = isMobile ? "mobile" : "desktop";
    const tabData = tabs.find((tab) => tab.id === activeTab)?.contentHook;
    return tabData?.[viewport] ?? [[]]; // Return content or empty slide array
  };

  const currentContentPages = getCurrentContent();
  const currentSlideContent = currentContentPages[activeSlide] ?? []; // Get items for the active slide
  const maxSlides = currentContentPages.length;

  const handleNextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % maxSlides);
  const handlePrevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + maxSlides) % maxSlides);

  // Reset active slide when switching tabs or viewport changes affect maxSlides
  useEffect(() => {
    setActiveSlide(0);
  }, [activeTab, maxSlides]); // Reset also if maxSlides changes (e.g., viewport switch)

  return (
    <div className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} // setActiveSlide handled by useEffect
              className={`px-4 md:px-8 py-4 font-medium text-base md:text-lg transition-colors relative whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Products Container - Render ProductSlide only if there's content */}
        <div className="relative">
          {currentSlideContent.length > 0 ? (
            <ProductSlide
              products={currentSlideContent} // Pass StoreItem[] or {isEmpty: true}[]
              isMobile={isMobile}
              activeTab={activeTab}
              tabName={tabs[activeTab].name}
              userRole={userRole} // Pass userRole down
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No items to display in this section yet.
              {/* Optionally add button for editor to add first item */}
            </div>
          )}

          {/* Navigation Buttons */}
          {maxSlides > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-background border border-border rounded-full p-2 shadow-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous slide"
                disabled={maxSlides <= 1} // Disable if only one slide
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-background border border-border rounded-full p-2 shadow-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next slide"
                disabled={maxSlides <= 1} // Disable if only one slide
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {maxSlides > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(maxSlides)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors
                    ${activeSlide === idx ? "bg-primary" : "bg-secondary hover:bg-muted"}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;

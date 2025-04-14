"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBestSellersContent } from "./_components/(best-seller)/BestSellers";
import { useOnSaleContent } from "./_components/(on-sale)/OnSale";
import { ProductSlide } from "./_components/ProductSlide";
import { useNewArrivalsContent } from "./_components/(new-arrivals)/NewArrivals";
import { ProductCardProps } from "./types";

type Viewport = "mobile" | "desktop";

type ViewportContent = {
  [key in Viewport]: ProductCardProps[][];
};

const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const newArrivalsContent = useNewArrivalsContent() as ViewportContent;
  const bestSellersContent = useBestSellersContent() as ViewportContent;
  const onSaleContent = useOnSaleContent() as ViewportContent;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const tabs = [
    { name: "New Arrivals", id: 0 },
    { name: "Best Sellers", id: 1 },
    { name: "On Sale", id: 2 },
  ];

  const getContent = (tabId: number): ProductCardProps[][] => {
    const viewport: Viewport = isMobile ? "mobile" : "desktop";

    switch (tabId) {
      case 0:
        return newArrivalsContent[viewport] || [[]];
      case 1:
        return bestSellersContent[viewport] || [[]];
      case 2:
        return onSaleContent[viewport] || [[]];
      default:
        return [[]];
    }
  };

  const currentContent = getContent(activeTab);
  const currentSlideContent = currentContent[activeSlide] || [];
  const maxSlides = currentContent.length;

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % maxSlides);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const renderSlide = () => {
    return (
      <ProductSlide
        products={currentSlideContent}
        isMobile={isMobile}
        activeTab={activeTab}
        tabName={tabs[activeTab].name}
      />
    );
  };

  // Reset active slide when switching tabs
  useEffect(() => {
    setActiveSlide(0);
  }, [activeTab]);

  return (
    <div className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveSlide(0);
              }}
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

        {/* Products Container */}
        <div className="relative">
          <div className="overflow-hidden">
            <div className="transition-transform duration-300 ease-in-out">
              {renderSlide()}
            </div>
          </div>

          {/* Navigation Buttons */}
          {maxSlides > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-background border border-border rounded-full p-2 shadow-md hover:bg-secondary transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-background border border-border rounded-full p-2 shadow-md hover:bg-secondary transition-colors"
                aria-label="Next slide"
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
                  className={`w-2 h-2 rounded-full transition-colors
                    ${activeSlide === idx ? "bg-primary" : "bg-secondary"}`}
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

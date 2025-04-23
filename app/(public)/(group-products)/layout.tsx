// app/(public)/(group-products)/layout.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import FilterSidebar from "./_components/(filterside)/FilterSidebar";
import { useProductStore } from "./_components/_store/product-store";
import EditableCollectionBanner from "./_components/EditableCollectionBanner";
import { getCollectionBanner } from "./_actions/bannerActions";

// Define known categories and their display names
const CATEGORY_MAP: Record<string, string> = {
  headwear: "Headwear",
  apparel: "Apparel",
  "all-collections": "All Collections",
};

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const hasInitialized = useRef(false);
  const pathname = usePathname();

  const [bannerUrl, setBannerUrl] = useState<string | null | undefined>(
    undefined,
  );
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const currentCategory = useMemo(() => {
    if (!pathname) return null;
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1]?.toLowerCase();
    return lastSegment && CATEGORY_MAP[lastSegment] ? lastSegment : null;
  }, [pathname]);

  const currentCategoryName = useMemo(() => {
    return currentCategory ? CATEGORY_MAP[currentCategory] : "Collection";
  }, [currentCategory]);

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchProducts();
      hasInitialized.current = true;
    }
  }, [fetchProducts]);

  useEffect(() => {
    async function fetchBannerForLayout() {
      if (!currentCategory) {
        setBannerUrl(null);
        setIsLoadingBanner(false);
        setBannerError(null);
        return;
      }
      setIsLoadingBanner(true);
      setBannerError(null);
      const result = await getCollectionBanner(currentCategory);
      if (result.success) {
        setBannerUrl(result.bannerUrl);
      } else {
        setBannerUrl(null);
        setBannerError(result.error || "Failed to load banner.");
      }
      setIsLoadingBanner(false);
    }
    fetchBannerForLayout();
  }, [currentCategory]);

  return (
    // --- ADJUSTED MARGIN HERE ---
    // Reduced top margin to create space ABOVE banner
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      {/* --- BANNER SECTION --- */}
      {/* Conditionally render banner or error message */}
      {/* Note: EditableCollectionBanner already includes mb-6/md:mb-8, which contributes to spacing below */}
      {currentCategory && (
        <EditableCollectionBanner
          initialBannerUrl={bannerUrl}
          category={currentCategory}
          categoryName={currentCategoryName}
          isLoading={isLoadingBanner}
        />
      )}
      {bannerError && !isLoadingBanner && (
        <div className="text-center py-4 text-red-500 mb-6 md:mb-8 border border-red-200 bg-red-50 rounded-md">
          Could not load collection banner: {bannerError}
        </div>
      )}
      {/* --- END BANNER --- */}

      {/* --- ADJUSTED MARGIN HERE --- */}
      {/* Container for Filters + Main Content */}
      {/* Added top margin to create space BELOW banner */}
      {/* NOTE: If the banner section above renders nothing (e.g., no banner URL and not editor),
           this margin will apply directly below the site navbar (plus the outer div's mt-8).
           If banner IS rendered, its own bottom margin (mb-6/md:mb-8) also adds space.
           Consider removing mb-* from EditableCollectionBanner if you want *only* this mt-8 below it.
           Let's keep both for now for clear separation. */}
      <div className="flex flex-col lg:flex-row gap-x-8 mt-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0 mb-6 lg:mb-0">
          <div className="lg:sticky top-28">
            {" "}
            {/* Adjust sticky top offset if needed due to navbar height changes */}
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content Area (page content like grid, title) */}
        <main className="flex-1 min-w-0">
          {children} {/* Renders the specific page.tsx output */}
        </main>
      </div>
    </div>
  );
}

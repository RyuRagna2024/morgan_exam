"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import FilterSidebar from "./_components/(filterside)/FilterSidebar";
import { useProductStore } from "./_components/_store/product-store";
import EditableCollectionBanner from "./_components/EditableCollectionBanner"; // Ensure this component handles its own bottom margin
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

  // Calculate sticky top offset (assuming h-16 navbar + 1rem gap = 5rem = top-20)
  // Adjust '5rem' and 'top-20' if your navbar height or desired gap is different
  const stickyTopOffset = "5rem"; // Example: 4rem navbar + 1rem gap
  const stickyTopClass = "top-20"; // Corresponding Tailwind class

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      {/* Banner Section */}
      {currentCategory && (
        <EditableCollectionBanner
          initialBannerUrl={bannerUrl}
          category={currentCategory}
          categoryName={currentCategoryName}
          isLoading={isLoadingBanner}
          // Ensure the EditableCollectionBanner component itself adds bottom margin (e.g., mb-6 md:mb-8) internally
        />
      )}
      {bannerError && !isLoadingBanner && (
        // Keep margin on the error message container
        <div className="text-center py-4 text-red-500 mb-6 md:mb-8 border border-red-200 bg-red-50 rounded-md">
          Could not load collection banner: {bannerError}
        </div>
      )}

      {/* Container for Filters + Main Content */}
      {/* --- MODIFIED: Added lg:items-start --- */}
      <div className="flex flex-col lg:flex-row gap-x-8 mt-8 lg:items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0 mb-6 lg:mb-0">
          {/* Sticky wrapper remains the same */}
          <div
            className={`lg:sticky ${stickyTopClass} lg:max-h-[calc(100vh-${stickyTopOffset})] lg:overflow-y-auto`}
          >
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

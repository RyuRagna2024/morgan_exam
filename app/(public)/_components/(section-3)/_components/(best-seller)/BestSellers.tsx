import { useMemo, useEffect } from "react";
import { ProductCardProps, TabContent } from "../../types";
import { useSession } from "@/app/SessionProvider";
import useBestSellerStore from "../../_store/(best-store)/best-seller-store";

const SLOTS_PER_PAGE = {
  mobile: 2,
  desktop: 4,
};

// Hook to manage best sellers content
export const useBestSellersContent = (): TabContent => {
  const { bestSellers, fetchBestSellers, isLoading } = useBestSellerStore();
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR";

  // Fetch data on mount
  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  return useMemo(() => {
    // Convert best sellers to ProductCardProps format
    const convertedProducts: ProductCardProps[] = bestSellers.map((item) => ({
      name: item.name,
      price: item.price.toString(),
      rating: item.rating,
      image: item.imageUrl,
    }));

    // Create mobile and desktop pages
    const mobilePages: ProductCardProps[][] = [];
    const desktopPages: ProductCardProps[][] = [];

    // Fill mobile pages (2 items per page)
    for (let i = 0; i < convertedProducts.length; i += SLOTS_PER_PAGE.mobile) {
      mobilePages.push(convertedProducts.slice(i, i + SLOTS_PER_PAGE.mobile));
    }

    // Fill desktop pages (4 items per page)
    for (let i = 0; i < convertedProducts.length; i += SLOTS_PER_PAGE.desktop) {
      desktopPages.push(convertedProducts.slice(i, i + SLOTS_PER_PAGE.desktop));
    }

    // Function to add empty slots for editors
    const addEmptySlots = (
      pages: ProductCardProps[][],
      slotsPerPage: number,
    ): ProductCardProps[][] => {
      // If not an editor or loading, return pages as is
      if (!isEditor || isLoading) {
        return pages.length > 0 ? pages : [[]];
      }

      if (pages.length === 0) {
        // Create a page with empty slots if no content
        return [Array(slotsPerPage).fill({ isEmpty: true })];
      }

      const lastPage = pages[pages.length - 1];
      const remainingSlots = slotsPerPage - (lastPage.length % slotsPerPage);

      if (remainingSlots < slotsPerPage) {
        // Fill remaining slots in the last page
        lastPage.push(...Array(remainingSlots).fill({ isEmpty: true }));
      }

      // Add a new page with empty slots if all pages are full
      if (lastPage.length === slotsPerPage) {
        pages.push(Array(slotsPerPage).fill({ isEmpty: true }));
      }

      return pages;
    };

    const content = {
      mobile: addEmptySlots([...mobilePages], SLOTS_PER_PAGE.mobile),
      desktop: addEmptySlots([...desktopPages], SLOTS_PER_PAGE.desktop),
    };

    return content;
  }, [bestSellers, isEditor, isLoading]);
};

// Best Sellers component that uses the hook
const BestSellers = () => {
  const content = useBestSellersContent();
  return content;
};

export { BestSellers };
export const BestSellersContent = {}; // For backwards compatibility if needed

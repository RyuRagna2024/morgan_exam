// app/(public)/_components/(section-3)/_components/(new-arrivals)/NewArrivals.tsx
import { useMemo, useEffect } from "react";
// --- Correctly import the exported type and the default hook ---
import useNewArrivalsStore, {
  NewArrival,
} from "../../_store/(new-store)/new-arrival-store";
// --- Use StoreItem and TabContent types ---
import { StoreItem, TabContent, Viewport, EmptySlot } from "../../types"; // Adjust path if needed
import { useSession } from "@/app/SessionProvider"; // Adjust path if needed

const SLOTS_PER_PAGE: Record<Viewport, number> = {
  mobile: 2,
  desktop: 4,
};

// Helper to convert raw store data (NewArrival) to the common StoreItem structure
// Ensure all necessary fields used by ProductCard (via convertToCardProps) are included
const convertToStoreItem = (item: NewArrival): StoreItem => ({
  id: item.id,
  name: item.name,
  rating: item.rating,
  imageUrl: item.imageUrl,
  price: item.price, // Keep as number for StoreItem type
  // Add originalPrice/salePrice as undefined if StoreItem requires them (it shouldn't for NA)
});

export const useNewArrivalsContent = (): TabContent => {
  // Destructure isLoading separately if needed for displaying a loading indicator elsewhere
  const { newArrivals: rawArrivals, fetchNewArrivals /*, isLoading */ } =
    useNewArrivalsStore();
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR";

  // Fetch data on component mount or when fetch function changes
  useEffect(() => {
    fetchNewArrivals();
  }, [fetchNewArrivals]);

  // --- useMemo calculation without isLoading dependency ---
  const memoizedContent = useMemo(() => {
    console.log("[useNewArrivalsContent] Recalculating memoized content...");
    console.log(
      "[useNewArrivalsContent] Raw Arrivals from store:",
      rawArrivals,
    );

    // Convert raw data to StoreItem format
    const storeItems: StoreItem[] = rawArrivals.map(convertToStoreItem);
    console.log("[useNewArrivalsContent] Converted StoreItems:", storeItems);

    // Helper function to create paginated slides
    const createPages = (
      items: StoreItem[],
      slotsPerPage: number,
    ): (StoreItem | EmptySlot)[][] => {
      const pages: (StoreItem | EmptySlot)[][] = [];
      if (!items || items.length === 0) {
        return pages; // Return empty array if no items
      }
      for (let i = 0; i < items.length; i += slotsPerPage) {
        pages.push(items.slice(i, i + slotsPerPage));
      }
      console.log(
        `[useNewArrivalsContent] Created initial pages (${slotsPerPage} slots):`,
        JSON.parse(JSON.stringify(pages)),
      );
      return pages;
    };

    const mobilePages = createPages(storeItems, SLOTS_PER_PAGE.mobile);
    const desktopPages = createPages(storeItems, SLOTS_PER_PAGE.desktop);

    // Helper function to add empty slots for editor view
    const addEmptySlots = (
      pages: (StoreItem | EmptySlot)[][],
      slotsPerPage: number,
    ): (StoreItem | EmptySlot)[][] => {
      // If not an editor, return pages (ensure at least one empty slide array if no pages)
      if (!isEditor) {
        console.log(
          "[useNewArrivalsContent] Not editor, returning pages:",
          pages,
        );
        return pages.length > 0 ? pages : [[]];
      }

      // If editor and no items have been loaded yet, return one page of empty slots
      if (storeItems.length === 0) {
        console.log(
          "[useNewArrivalsContent] Editor, no items, returning empty slots page.",
        );
        return [Array(slotsPerPage).fill({ isEmpty: true })];
      }

      // If items exist, process the pages
      const processedPages = [...pages]; // Create a copy to modify

      // If no pages were created (e.g., items < slotsPerPage, but > 0), start with one page
      if (processedPages.length === 0 && storeItems.length > 0) {
        processedPages.push(storeItems.slice(0, slotsPerPage));
      }

      if (processedPages.length > 0) {
        const lastPage = processedPages[processedPages.length - 1];
        const filledSlots = lastPage.length;
        const neededSlots = slotsPerPage - filledSlots;

        // Add empty slots to the last page if it's not full
        if (neededSlots > 0 && neededSlots < slotsPerPage) {
          // Check neededSlots < slotsPerPage to avoid filling a completely empty added page
          console.log(
            `[useNewArrivalsContent] Adding ${neededSlots} empty slots to last page (${slotsPerPage} slots).`,
          );
          lastPage.push(...Array(neededSlots).fill({ isEmpty: true }));
        }
        // If the last page is exactly full OR if there were no pages initially but items exist
        if (
          filledSlots === slotsPerPage ||
          (pages.length === 0 && storeItems.length > 0)
        ) {
          console.log(
            `[useNewArrivalsContent] Last page full or initial page created, adding new empty slots page (${slotsPerPage} slots).`,
          );
          processedPages.push(Array(slotsPerPage).fill({ isEmpty: true }));
        }
      }
      // If somehow pages is still empty even though items exist
      else if (storeItems.length > 0) {
        console.log(
          "[useNewArrivalsContent] Editor, items exist but no pages array generated, adding empty slots page.",
        );
        processedPages.push(Array(slotsPerPage).fill({ isEmpty: true }));
      }

      console.log(
        `[useNewArrivalsContent] Final pages with empty slots (${slotsPerPage} slots):`,
        JSON.parse(JSON.stringify(processedPages)),
      );
      return processedPages;
    };
    // --- End Add Empty Slots Logic ---

    const finalMobile = addEmptySlots(mobilePages, SLOTS_PER_PAGE.mobile);
    const finalDesktop = addEmptySlots(desktopPages, SLOTS_PER_PAGE.desktop);

    return {
      mobile: finalMobile,
      desktop: finalDesktop,
    };
    // --- Dependencies only include values that affect the calculation ---
  }, [rawArrivals, isEditor]); // REMOVED isLoading
  // --- End Dependency Change ---

  return memoizedContent; // Return the memoized value
};

// Removed dummy component export, the hook is the main export now
// export { NewArrivals };

// app/(public)/_components/(section-3)/_components/(best-seller)/BestSellers.tsx
import { useMemo, useEffect } from "react";
// --- Import type and hook from store ---
import useBestSellerStore, {
  BestSeller,
} from "../../_store/(best-store)/best-seller-store"; // Adjust path if needed
// --- Use common types ---
import { StoreItem, TabContent, Viewport, EmptySlot } from "../../types"; // Adjust path if needed
import { useSession } from "@/app/SessionProvider"; // Adjust path if needed

const SLOTS_PER_PAGE: Record<Viewport, number> = {
  mobile: 2,
  desktop: 4,
};

// Helper to convert raw store data (BestSeller) to the common StoreItem structure
const convertToStoreItem = (item: BestSeller): StoreItem => ({
  id: item.id,
  name: item.name,
  rating: item.rating,
  imageUrl: item.imageUrl,
  price: item.price, // Best Sellers have 'price'
});

export const useBestSellersContent = (): TabContent => {
  // Destructure hook values
  const {
    bestSellers: rawBestSellers,
    fetchBestSellers,
    isLoading,
  } = useBestSellerStore(); // Keep isLoading if needed outside memo
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR";

  // Fetch data on mount
  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  // --- useMemo calculation with refined empty slot logic ---
  return useMemo(() => {
    console.log("=============================================="); // Separator
    console.log("[useBestSellersContent] Recalculating memoized content...");
    console.log("[useBestSellersContent] isEditor:", isEditor);
    // Log raw data carefully
    console.log(
      "[useBestSellersContent] Raw Best Sellers from store (first 10):",
      Array.isArray(rawBestSellers)
        ? rawBestSellers.slice(0, 10)
        : "Not an array or null",
    );
    console.log(
      `[useBestSellersContent] Total raw items: ${rawBestSellers?.length ?? 0}`,
    );

    // 1. Convert to StoreItem format
    const storeItems: StoreItem[] = Array.isArray(rawBestSellers)
      ? rawBestSellers.map(convertToStoreItem)
      : [];
    console.log("[useBestSellersContent] Converted StoreItems:", storeItems);

    // 2. Define Pagination Function
    const createPages = (
      items: StoreItem[],
      slotsPerPage: number,
    ): StoreItem[][] => {
      const pages: StoreItem[][] = [];
      if (!items || items.length === 0) return pages;
      for (let i = 0; i < items.length; i += slotsPerPage) {
        pages.push(items.slice(i, i + slotsPerPage));
      }
      console.log(
        `[useBestSellersContent] Paginated items created (${slotsPerPage} slots per page). Total pages: ${pages.length}`,
      );
      return pages;
    };

    // 3. Define Refined Empty Slot Addition Function
    const addEmptySlots = (
      paginatedItems: StoreItem[][], // Takes pages of StoreItems
      slotsPerPage: number,
    ): (StoreItem | EmptySlot)[][] => {
      // Returns pages including EmptySlots
      console.log(
        `[useBestSellersContent] Running addEmptySlots for ${slotsPerPage} slots/page...`,
      );

      if (!isEditor) {
        console.log("[useBestSellersContent] addEmptySlots: Not editor.");
        // Return the paginated items, ensuring at least [[]] for consistency downstream
        return paginatedItems.length > 0 ? paginatedItems : [[]];
      }

      // If editor and NO items exist at all in the store, return ONE page of empty slots
      if (storeItems.length === 0) {
        console.log(
          "[useBestSellersContent] addEmptySlots: Editor, no items, returning single empty page.",
        );
        return [Array(slotsPerPage).fill({ isEmpty: true })];
      }

      // If items exist, work with the paginated data
      const pagesWithSlots = [...paginatedItems.map((page) => [...page])]; // Deep copy pages

      // Determine if the last page containing actual items is full
      let isLastItemPageFull = false;

      // If no pages were created by pagination (e.g., 1 item, 4 slots/page), create the first page now
      if (pagesWithSlots.length === 0 && storeItems.length > 0) {
        console.log(
          "[useBestSellersContent] addEmptySlots: Items exist but no pages created, adding first page from items.",
        );
        pagesWithSlots.push(storeItems.slice(0, slotsPerPage));
      }

      // Check the last page for remaining slots
      if (pagesWithSlots.length > 0) {
        // Find the index of the last page that contains at least one actual StoreItem
        let lastItemPageIndex = -1;
        for (let i = pagesWithSlots.length - 1; i >= 0; i--) {
          if (pagesWithSlots[i].some((item) => item && !("isEmpty" in item))) {
            // Check it's not an empty slot marker
            lastItemPageIndex = i;
            break;
          }
        }

        if (lastItemPageIndex !== -1) {
          const lastItemPage = pagesWithSlots[lastItemPageIndex];
          const filledSlots = lastItemPage.length;
          const neededSlots = slotsPerPage - filledSlots;

          console.log(
            `[useBestSellersContent] addEmptySlots: Last item page (index ${lastItemPageIndex}) has ${filledSlots} items, needs ${neededSlots} empty slots.`,
          );

          // Add empty slots to the last page containing items ONLY if it's not already full
          if (neededSlots > 0) {
            console.log(
              `[useBestSellersContent] addEmptySlots: Adding ${neededSlots} empty slots to last item page.`,
            );
            lastItemPage.push(...Array(neededSlots).fill({ isEmpty: true }));
          }
          // Determine if this last *item* page is now full
          isLastItemPageFull = lastItemPage.length === slotsPerPage;
        } else if (storeItems.length > 0) {
          // Items exist, but all pages somehow only contained empty slots? Fallback.
          console.warn(
            "[useBestSellersContent] addEmptySlots: No pages with actual items found, though storeItems exist. Resetting.",
          );
          // Reset to a single page with empty slots as something is inconsistent
          return [Array(slotsPerPage).fill({ isEmpty: true })];
        }
        // If lastItemPageIndex is -1 and storeItems is empty, the earlier check handled it.
      }
      // If somehow pages is still empty even though items exist (should be caught above)
      else if (storeItems.length > 0) {
        console.warn(
          "[useBestSellersContent] addEmptySlots: Fallback - Items exist but pages array is empty, adding empty page.",
        );
        pagesWithSlots.push(Array(slotsPerPage).fill({ isEmpty: true }));
        isLastItemPageFull = true; // Assume this scenario implies needing another empty page
      }

      // Add a NEW page of only empty slots if the last page *containing items* ended up being full
      if (isLastItemPageFull) {
        console.log(
          `[useBestSellersContent] addEmptySlots: Last item page is full, adding new empty page.`,
        );
        pagesWithSlots.push(Array(slotsPerPage).fill({ isEmpty: true }));
      }

      console.log(
        `[useBestSellersContent] addEmptySlots: Final pages result (${slotsPerPage} slots/page):`,
        JSON.parse(JSON.stringify(pagesWithSlots)),
      );
      return pagesWithSlots;
    };
    // --- End Refined Add Empty Slots Logic ---

    // 4. Execute the pipeline
    const paginatedMobile = createPages(storeItems, SLOTS_PER_PAGE.mobile);
    const paginatedDesktop = createPages(storeItems, SLOTS_PER_PAGE.desktop);

    const finalMobile = addEmptySlots(paginatedMobile, SLOTS_PER_PAGE.mobile);
    const finalDesktop = addEmptySlots(
      paginatedDesktop,
      SLOTS_PER_PAGE.desktop,
    );

    console.log("[useBestSellersContent] FINAL calculated content:", {
      mobile: finalMobile,
      desktop: finalDesktop,
    });
    console.log("=============================================="); // Separator

    return {
      mobile: finalMobile,
      desktop: finalDesktop,
    };
    // Dependencies only include values that affect the calculation
  }, [rawBestSellers, isEditor]); // Removed isLoading
};

// Optional dummy export if needed elsewhere, otherwise remove
// export const BestSellers = () => null;

// app/(public)/_components/(section-3)/_components/(on-sale)/OnSale.tsx
import { useMemo, useEffect } from "react";
// --- Import type and hook from store ---
import useOnSaleStore, {
  OnSaleItem,
} from "../../_store/(on-sale)/on-sale-store"; // Adjust path if needed
// --- Use common types ---
import { StoreItem, TabContent, Viewport, EmptySlot } from "../../types"; // Adjust path if needed
import { useSession } from "@/app/SessionProvider"; // Adjust path if needed

const SLOTS_PER_PAGE: Record<Viewport, number> = {
  mobile: 2,
  desktop: 4,
};

// Helper to convert raw store data (OnSaleItem) to the common StoreItem structure
const convertToStoreItem = (item: OnSaleItem): StoreItem => ({
  id: item.id,
  name: item.name,
  rating: item.rating,
  imageUrl: item.imageUrl,
  // --- Include sale-specific prices ---
  originalPrice: item.originalPrice, // Keep as number
  salePrice: item.salePrice, // Keep as number
  // 'price' field will be undefined for sale items using this structure
});

export const useOnSaleContent = (): TabContent => {
  // Destructure hook values
  const {
    onSaleItems: rawOnSaleItems,
    fetchOnSaleItems,
    isLoading,
  } = useOnSaleStore();
  const { user } = useSession();
  const isEditor = user?.role === "EDITOR";

  // Fetch data on mount
  useEffect(() => {
    fetchOnSaleItems();
  }, [fetchOnSaleItems]);

  // --- useMemo calculation (Identical structure to others) ---
  return useMemo(() => {
    console.log("==============================================");
    console.log("[useOnSaleContent] Recalculating memoized content...");
    console.log("[useOnSaleContent] isEditor:", isEditor);
    console.log(
      "[useOnSaleContent] Raw On Sale from store (first 10):",
      Array.isArray(rawOnSaleItems)
        ? rawOnSaleItems.slice(0, 10)
        : "Not an array or null",
    );
    console.log(
      `[useOnSaleContent] Total raw items: ${rawOnSaleItems?.length ?? 0}`,
    );

    // 1. Convert to StoreItem format
    const storeItems: StoreItem[] = Array.isArray(rawOnSaleItems)
      ? rawOnSaleItems.map(convertToStoreItem)
      : [];
    console.log("[useOnSaleContent] Converted StoreItems:", storeItems);

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
        `[useOnSaleContent] Paginated items created (${slotsPerPage} slots per page). Total pages: ${pages.length}`,
      );
      return pages;
    };

    // 3. Define Empty Slot Addition Function
    const addEmptySlots = (
      paginatedItems: StoreItem[][],
      slotsPerPage: number,
    ): (StoreItem | EmptySlot)[][] => {
      console.log(
        `[useOnSaleContent] Running addEmptySlots for ${slotsPerPage} slots/page...`,
      );
      if (!isEditor) {
        console.log("[useOnSaleContent] addEmptySlots: Not editor.");
        return paginatedItems.length > 0 ? paginatedItems : [[]];
      }

      if (storeItems.length === 0) {
        console.log(
          "[useOnSaleContent] addEmptySlots: Editor, no items, returning single empty page.",
        );
        return [Array(slotsPerPage).fill({ isEmpty: true })];
      }

      const pagesWithSlots = [...paginatedItems.map((page) => [...page])];

      if (pagesWithSlots.length === 0 && storeItems.length > 0) {
        console.log(
          "[useOnSaleContent] addEmptySlots: Items exist but no pages created, adding first page from items.",
        );
        pagesWithSlots.push(storeItems.slice(0, slotsPerPage));
      }

      if (pagesWithSlots.length > 0) {
        let lastItemPageIndex = -1;
        for (let i = pagesWithSlots.length - 1; i >= 0; i--) {
          if (pagesWithSlots[i].some((item) => item && !("isEmpty" in item))) {
            lastItemPageIndex = i;
            break;
          }
        }

        if (lastItemPageIndex !== -1) {
          const lastItemPage = pagesWithSlots[lastItemPageIndex];
          const filledSlots = lastItemPage.length;
          const neededSlots = slotsPerPage - filledSlots;
          console.log(
            `[useOnSaleContent] addEmptySlots: Last item page (index ${lastItemPageIndex}) has ${filledSlots} items, needs ${neededSlots} empty slots.`,
          );
          if (neededSlots > 0) {
            console.log(
              `[useOnSaleContent] addEmptySlots: Adding ${neededSlots} empty slots to last item page.`,
            );
            lastItemPage.push(...Array(neededSlots).fill({ isEmpty: true }));
          }
          const isLastItemPageFull = lastItemPage.length === slotsPerPage;
          if (isLastItemPageFull) {
            console.log(
              `[useOnSaleContent] addEmptySlots: Last item page is full, adding new empty page.`,
            );
            pagesWithSlots.push(Array(slotsPerPage).fill({ isEmpty: true }));
          }
        } else if (storeItems.length > 0) {
          console.warn(
            "[useOnSaleContent] addEmptySlots: No pages with actual items found, though storeItems exist. Resetting.",
          );
          return [Array(slotsPerPage).fill({ isEmpty: true })];
        }
      } else if (storeItems.length > 0) {
        console.warn(
          "[useOnSaleContent] addEmptySlots: Fallback - Items exist but no pages array generated, adding empty page.",
        );
        pagesWithSlots.push(Array(slotsPerPage).fill({ isEmpty: true }));
        // Optionally add another empty page if the fallback logic fills the first one:
        // if (pagesWithSlots[0].length === slotsPerPage) {
        //    pagesWithSlots.push(Array(slotsPerPage).fill({ isEmpty: true }));
        // }
      }

      console.log(
        `[useOnSaleContent] addEmptySlots: Final pages result (${slotsPerPage} slots/page):`,
        JSON.parse(JSON.stringify(pagesWithSlots)),
      );
      return pagesWithSlots;
    };
    // --- End Functions ---

    // 4. Execute the pipeline
    const paginatedMobile = createPages(storeItems, SLOTS_PER_PAGE.mobile);
    const paginatedDesktop = createPages(storeItems, SLOTS_PER_PAGE.desktop);

    const finalMobile = addEmptySlots(paginatedMobile, SLOTS_PER_PAGE.mobile);
    const finalDesktop = addEmptySlots(
      paginatedDesktop,
      SLOTS_PER_PAGE.desktop,
    );

    console.log("[useOnSaleContent] FINAL calculated content:", {
      mobile: finalMobile,
      desktop: finalDesktop,
    });
    console.log("==============================================");

    return { mobile: finalMobile, desktop: finalDesktop };
  }, [rawOnSaleItems, isEditor]); // Dependencies
};

// Optional dummy export
// export const OnSale = () => null;

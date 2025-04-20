// // app/(public)/(group-products)/_components/_store/wishlist-store.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Variation } from "../(filterside)/types";
import {
  getUserWishlist,
  removeFromWishlist,
  addToWishlist,
} from "../(filterside)/wish-list";

interface WishlistItem {
  id: string;
  variationId: string;
  variation: {
    id: string;
    name: string;
    color: string;
    size: string;
    sku: string;
    quantity: number;
    price: number;
    imageUrl: string;
    product: {
      id: string;
      productName: string;
      productImgUrl: string;
      sellingPrice: number;
    };
  };
}

interface WishlistState {
  // State
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  lastMessage: string | null;

  // Cache of which variations are in wishlist for quick lookup
  wishlistVariationIds: Set<string>;

  // Actions
  fetchWishlist: () => Promise<void>;
  addItemToWishlist: (variationId: string) => Promise<void>;
  removeItemFromWishlist: (variationId: string) => Promise<void>;
  toggleWishlistItem: (variationId: string) => Promise<void>;
  clearWishlistMessage: () => void;
  clearWishlistError: () => void;

  // Getters
  isInWishlist: (variationId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        wishlistItems: [],
        isLoading: false,
        isProcessing: false,
        error: null,
        lastMessage: null,
        wishlistVariationIds: new Set<string>(),

        // Actions
        fetchWishlist: async () => {
          set({ isLoading: true, error: null });

          try {
            const result = await getUserWishlist();

            if (!result.success) {
              throw new Error(result.error || "Failed to fetch wishlist");
            }

            // Create a set of variation IDs for quick lookup
            const variationIds = new Set<string>();
            if (result.wishlistItems) {
              result.wishlistItems.forEach((item) => {
                variationIds.add(item.variationId);
              });
            }

            set({
              wishlistItems: result.wishlistItems || [],
              wishlistVariationIds: variationIds,
              isLoading: false,
            });
          } catch (error) {
            console.error("Error fetching wishlist:", error);
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        },

        addItemToWishlist: async (variationId: string) => {
          set({ isProcessing: true, error: null, lastMessage: null });

          try {
            const result = await addToWishlist(variationId);

            if (!result.success) {
              throw new Error(result.error || "Failed to add item to wishlist");
            }

            // If successfully added, update local state
            if (result.success) {
              // Refetch the wishlist to get the updated items with product info
              await get().fetchWishlist();

              set({
                lastMessage: result.message || "Item added to wishlist",
                isProcessing: false,
              });
            }
          } catch (error) {
            console.error("Error adding to wishlist:", error);
            set({
              isProcessing: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        },

        removeItemFromWishlist: async (variationId: string) => {
          set({ isProcessing: true, error: null, lastMessage: null });

          try {
            const result = await removeFromWishlist(variationId);

            if (!result.success) {
              throw new Error(
                result.error || "Failed to remove item from wishlist",
              );
            }

            // If successfully removed, update local state
            // First, update the quick lookup set
            const newVariationIds = new Set(get().wishlistVariationIds);
            newVariationIds.delete(variationId);

            // Then filter out the removed item
            set({
              wishlistItems: get().wishlistItems.filter(
                (item) => item.variationId !== variationId,
              ),
              wishlistVariationIds: newVariationIds,
              lastMessage: result.message || "Item removed from wishlist",
              isProcessing: false,
            });
          } catch (error) {
            console.error("Error removing from wishlist:", error);
            set({
              isProcessing: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        },

        toggleWishlistItem: async (variationId: string) => {
          // Check if the item is already in the wishlist
          const isInWishlist = get().wishlistVariationIds.has(variationId);

          if (isInWishlist) {
            await get().removeItemFromWishlist(variationId);
          } else {
            await get().addItemToWishlist(variationId);
          }
        },

        clearWishlistMessage: () => set({ lastMessage: null }),

        clearWishlistError: () => set({ error: null }),

        // Getters
        isInWishlist: (variationId: string) => {
          return get().wishlistVariationIds.has(variationId);
        },
      }),
      {
        name: "wishlist-store",
        partialize: (state) => ({
          // Only persist the variation IDs for quick lookup between sessions
          wishlistVariationIds: Array.from(state.wishlistVariationIds),
        }),
        // Custom serialization/deserialization for Set with proper type handling
        onRehydrateStorage: () => (state) => {
          // Check if state exists before accessing its properties
          if (state) {
            // Convert the array back to a Set when rehydrating
            if (Array.isArray(state.wishlistVariationIds)) {
              state.wishlistVariationIds = new Set(state.wishlistVariationIds);
            } else {
              // If not an array, initialize as an empty Set
              state.wishlistVariationIds = new Set<string>();
            }
          }
        },
      },
    ),
  ),
);

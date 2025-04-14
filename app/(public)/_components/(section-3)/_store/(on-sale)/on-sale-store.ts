import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createSecureStorage,
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage";
import {
  createOnSale,
  getOnSaleItemById,
  getOnSaleItems,
} from "../../_actions/(on-sale-actions)/on-sale-actions";

interface OnSaleItem {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  rating: number;
  imageUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    displayName: string;
  };
}

interface OnSaleState {
  // State
  onSaleItems: OnSaleItem[];
  isLoading: boolean;
  error: string | null;
  selectedOnSaleItem: OnSaleItem | null;
  lastFetched: number | null;

  // Actions
  fetchOnSaleItems: () => Promise<void>;
  fetchOnSaleItemById: (id: string) => Promise<void>;
  createOnSaleItem: (formData: FormData) => Promise<void>;
  setSelectedOnSaleItem: (item: OnSaleItem | null) => void;
  clearError: () => void;
}

// Cache duration: 30 days in milliseconds
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

const useOnSaleStore = create<OnSaleState>()(
  persist(
    (set, get) => ({
      // Initial state
      onSaleItems: [],
      isLoading: false,
      error: null,
      selectedOnSaleItem: null,
      lastFetched: null,

      // Fetch all on sale items with caching
      fetchOnSaleItems: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;

        // Only fetch if no cache exists or cache has expired
        if (!lastFetched || currentTime - lastFetched > CACHE_DURATION) {
          set({ isLoading: true, error: null });
          try {
            const response = await getOnSaleItems();
            if (response.success) {
              set({
                onSaleItems: response.data,
                lastFetched: currentTime,
              });
            } else {
              set({ error: response.error || "Failed to fetch on sale items" });
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred",
            });
          } finally {
            set({ isLoading: false });
          }
        }
      },

      // Fetch single on sale item by ID
      fetchOnSaleItemById: async (id: string) => {
        // Check if the item already exists in our cached data
        const existingItem = get().onSaleItems.find((item) => item.id === id);
        if (existingItem) {
          set({ selectedOnSaleItem: existingItem });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getOnSaleItemById(id);
          if (response.success) {
            set({ selectedOnSaleItem: response.data });
          } else {
            set({ error: response.error || "Failed to fetch on sale item" });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Create on sale item
      createOnSaleItem: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createOnSale(formData);
          if (response.success) {
            // Update the onSaleItems list with the new item
            const currentOnSaleItems = get().onSaleItems;
            set({
              onSaleItems: [...currentOnSaleItems, response.data],
              selectedOnSaleItem: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
          } else {
            set({ error: response.error || "Failed to create on sale item" });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Set selected on sale item
      setSelectedOnSaleItem: (item: OnSaleItem | null) => {
        set({ selectedOnSaleItem: item });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "on-sale-storage", // Name of the item in localStorage
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        onSaleItems: sanitizeProductData(state.onSaleItems),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useOnSaleStore;

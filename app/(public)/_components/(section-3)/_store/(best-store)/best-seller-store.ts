import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createBestSeller,
  getBestSeller,
  getBestSellerById,
} from "../../_actions/(best-seller-actions.ts)/upload-get-actions";
import {
  createSecureStorage,
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage";

interface BestSeller {
  id: string;
  name: string;
  price: number;
  rating: number;
  imageUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    displayName: string;
  };
}

interface BestSellerState {
  // State
  bestSellers: BestSeller[];
  isLoading: boolean;
  error: string | null;
  selectedBestSeller: BestSeller | null;
  lastFetched: number | null;

  // Actions
  fetchBestSellers: () => Promise<void>;
  fetchBestSellerById: (id: string) => Promise<void>;
  createBestSeller: (formData: FormData) => Promise<void>;
  setSelectedBestSeller: (bestSeller: BestSeller | null) => void;
  clearError: () => void;
}

// Cache duration: 30 days in milliseconds
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

const useBestSellerStore = create<BestSellerState>()(
  persist(
    (set, get) => ({
      // Initial state
      bestSellers: [],
      isLoading: false,
      error: null,
      selectedBestSeller: null,
      lastFetched: null,

      // Fetch all best sellers with caching
      fetchBestSellers: async () => {
        const currentTime = Date.now();
        const lastFetched = get().lastFetched;

        // Only fetch if no cache exists or cache has expired
        if (!lastFetched || currentTime - lastFetched > CACHE_DURATION) {
          set({ isLoading: true, error: null });
          try {
            const response = await getBestSeller();
            if (response.success) {
              set({
                bestSellers: response.data,
                lastFetched: currentTime,
              });
            } else {
              set({ error: response.error || "Failed to fetch best sellers" });
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

      // Fetch single best seller by ID
      fetchBestSellerById: async (id: string) => {
        // Check if the item already exists in our cached data
        const existingItem = get().bestSellers.find((item) => item.id === id);
        if (existingItem) {
          set({ selectedBestSeller: existingItem });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getBestSellerById(id);
          if (response.success) {
            set({ selectedBestSeller: response.data });
          } else {
            set({ error: response.error || "Failed to fetch best seller" });
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

      // Create best seller
      createBestSeller: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await createBestSeller(formData);
          if (response.success) {
            // Update the bestSellers list with the new item
            const currentBestSellers = get().bestSellers;
            set({
              bestSellers: [...currentBestSellers, response.data],
              selectedBestSeller: response.data,
              lastFetched: Date.now(), // Update last fetched timestamp
            });
          } else {
            set({ error: response.error || "Failed to create best seller" });
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

      // Set selected best seller
      setSelectedBestSeller: (bestSeller: BestSeller | null) => {
        set({ selectedBestSeller: bestSeller });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "best-seller-storage", // Name of the item in localStorage
      storage: isLocalStorageAvailable() ? createSecureStorage() : undefined,
      partialize: (state) => ({
        bestSellers: sanitizeProductData(state.bestSellers),
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

export default useBestSellerStore;

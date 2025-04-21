// app/(public)/_components/(section-3)/_store/(best-store)/best-seller-store.ts
import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import {
  createBestSeller as createAction,
  getBestSeller as getAction,
  getBestSellerById as getByIdAction,
} from "../../_actions/(best-seller-actions.ts)/upload-get-actions"; // Verify path
import {
  updateBestSeller as updateAction,
  deleteBestSeller as deleteAction,
} from "../../_actions/(best-seller-actions.ts)/update-delete-actions"; // Verify path
import {
  createSecureStorage,
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage"; // Verify path

// Export the interface
export interface BestSeller {
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

// Interface BestSellerState - includes all state fields and methods
interface BestSellerState {
  bestSellers: BestSeller[];
  isLoading: boolean;
  error: string | null;
  selectedBestSeller: BestSeller | null;
  lastFetched: number | null; // <<< Ensure lastFetched is here
  fetchBestSellers: () => Promise<void>;
  fetchBestSellerById: (id: string) => Promise<void>;
  createBestSeller: (formData: FormData) => Promise<boolean>;
  setSelectedBestSeller: (bestSeller: BestSeller | null) => void;
  clearError: () => void;
  updateBestSeller: (id: string, formData: FormData) => Promise<boolean>;
  deleteBestSeller: (id: string) => Promise<boolean>;
}

// Define the shape of the persisted state
type PersistedBestSellerState = {
  bestSellers: Omit<BestSeller, "userId">[]; // Sanitized
  lastFetched: number | null;
};

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

// Define the store logic using StateCreator
const bestSellerStoreLogic: StateCreator<
  BestSellerState,
  [], // No built-in middleware specified here
  [["zustand/persist", PersistedBestSellerState]] // Persist middleware signature
> = (set, get) => ({
  // Initial state values
  bestSellers: [],
  isLoading: false,
  error: null,
  selectedBestSeller: null,
  lastFetched: null, // Initialize lastFetched

  // Actions implementation
  fetchBestSellers: async () => {
    console.log("[Store:BestSeller] fetchBestSellers called.");
    set({ error: null });
    const currentTime = Date.now();
    const lastFetched = get().lastFetched; // Read correct property

    if (!lastFetched || currentTime - lastFetched > CACHE_DURATION) {
      console.log(
        "[Store:BestSeller] Cache expired or missing, fetching from server...",
      );
      set({ isLoading: true });
      try {
        const response = await getAction();
        console.log(
          "[Store:BestSeller] Response from getBestSeller action:",
          response,
        );
        if (response.success && Array.isArray(response.data)) {
          console.log(
            `[Store:BestSeller] Fetch successful, setting ${response.data.length} items.`,
          );
          set({
            bestSellers: response.data,
            lastFetched: currentTime,
            error: null,
          });
        } else {
          console.error(
            "[Store:BestSeller] Fetch failed or data invalid:",
            response.error,
          );
          set({
            error: response.error || "Failed to fetch best sellers",
            bestSellers: [],
            lastFetched: null,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Fetch error occurred";
        console.error("[Store:BestSeller] Fetch caught exception:", error);
        set({ error: message, bestSellers: [], lastFetched: null });
      } finally {
        set({ isLoading: false });
      }
    } else {
      console.log("[Store:BestSeller] Using cached data.");
    }
  },

  fetchBestSellerById: async (id: string) => {
    /* ... */
  },
  createBestSeller: async (formData: FormData): Promise<boolean> => {
    /* ... */ return false;
  },
  updateBestSeller: async (
    id: string,
    formData: FormData,
  ): Promise<boolean> => {
    /* ... */ return false;
  },
  deleteBestSeller: async (id: string): Promise<boolean> => {
    /* ... */ return false;
  },
  setSelectedBestSeller: (bestSeller: BestSeller | null) => {
    set({ selectedBestSeller: bestSeller, error: null });
  },
  clearError: () => {
    set({ error: null });
  },
});

// --- Define Persist Options Correctly ---
const persistOptions: PersistOptions<
  BestSellerState,
  PersistedBestSellerState
> = {
  name: "best-seller-storage", // <<< 'name' property is required
  storage: isLocalStorageAvailable()
    ? createSecureStorage<PersistedBestSellerState>()
    : undefined,
  partialize: (state): PersistedBestSellerState => ({
    bestSellers: sanitizeProductData(state.bestSellers),
    lastFetched: state.lastFetched,
  }),
  onRehydrateStorage: (state) => {
    console.log("Rehydrating best sellers store");
    return (state, error) => {
      if (error) {
        console.error("Failed to rehydrate best sellers store:", error);
      }
    };
  },
};
// --- End Persist Options ---

// --- Create the hook applying persist correctly ---
const useBestSellerStore = create<BestSellerState>()(
  persist(bestSellerStoreLogic, persistOptions), // Pass logic function first, then options
);
// --- End Hook Creation ---

// EXPORT the hook as the default
export default useBestSellerStore;

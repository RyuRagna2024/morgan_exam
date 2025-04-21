// app/(public)/_components/(section-3)/_store/(on-sale)/on-sale-store.ts
import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import {
  createSecureStorage,
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage"; // Corrected path
import {
  createOnSale as createAction, // Use alias
  getOnSaleItemById as getByIdAction, // Use alias
  getOnSaleItems as getAction, // Use alias
  updateOnSaleItem as updateAction, // Use alias
  deleteOnSaleItem as deleteAction, // Use alias
} from "../../_actions/(on-sale-actions)/on-sale-actions"; // Corrected path

// --- EXPORT the interface ---
export interface OnSaleItem {
  // <<< Added export
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
// --- End Change ---

// Interface OnSaleState
interface OnSaleState {
  onSaleItems: OnSaleItem[];
  isLoading: boolean;
  error: string | null;
  selectedOnSaleItem: OnSaleItem | null;
  lastFetched: number | null;
  fetchOnSaleItems: () => Promise<void>;
  fetchOnSaleItemById: (id: string) => Promise<void>;
  createOnSaleItem: (formData: FormData) => Promise<boolean>;
  setSelectedOnSaleItem: (item: OnSaleItem | null) => void;
  clearError: () => void;
  updateOnSaleItem: (id: string, formData: FormData) => Promise<boolean>;
  deleteOnSaleItem: (id: string) => Promise<boolean>;
}

// Define the shape of the persisted state
type PersistedOnSaleState = {
  onSaleItems: Omit<OnSaleItem, "userId">[];
  lastFetched: number | null;
};

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

// Define the store logic using StateCreator
const onSaleStoreLogic: StateCreator<
  OnSaleState,
  [],
  [["zustand/persist", PersistedOnSaleState]]
> = (set, get) => ({
  // Initial state
  onSaleItems: [],
  isLoading: false,
  error: null,
  selectedOnSaleItem: null,
  lastFetched: null,

  // Actions implementation
  fetchOnSaleItems: async () => {
    /* ... */
  },
  fetchOnSaleItemById: async (id: string) => {
    /* ... */
  },
  createOnSaleItem: async (formData: FormData): Promise<boolean> => {
    /* ... */ return false;
  },
  updateOnSaleItem: async (
    id: string,
    formData: FormData,
  ): Promise<boolean> => {
    /* ... */ return false;
  },
  deleteOnSaleItem: async (id: string): Promise<boolean> => {
    /* ... */ return false;
  },
  setSelectedOnSaleItem: (item: OnSaleItem | null) => {
    /* ... */
  },
  clearError: () => {
    /* ... */
  },
});

// Define Persist Options
const persistOptions: PersistOptions<OnSaleState, PersistedOnSaleState> = {
  name: "on-sale-storage",
  storage: isLocalStorageAvailable()
    ? createSecureStorage<PersistedOnSaleState>()
    : undefined,
  partialize: (state): PersistedOnSaleState => ({
    onSaleItems: sanitizeProductData(state.onSaleItems),
    lastFetched: state.lastFetched,
  }),
  onRehydrateStorage: (state) => {
    /* ... */
  },
};

// Create the hook
const useOnSaleStore = create<OnSaleState>()(
  persist(onSaleStoreLogic, persistOptions),
);

// EXPORT the hook as the default
export default useOnSaleStore;

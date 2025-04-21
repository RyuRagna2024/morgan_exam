// app/(public)/_components/(section-3)/_store/(new-store)/new-arrival-store.ts
import { create, StateCreator } from "zustand"; // Import StateCreator
import { persist, PersistOptions } from "zustand/middleware"; // Import PersistOptions

// --- Import ALL actions from their CORRECT files ---
import {
  createNewArrival as createAction, // Use aliases for clarity
  getNewArrivals as getAction,
  getNewArrivalById as getByIdAction,
} from "../../_actions/(new-arrivals-actions)/upload-get-actions"; // Actions for create/get

import {
  updateNewArrival as updateAction, // Use aliases
  deleteNewArrival as deleteAction, // Use aliases
} from "../../_actions/(new-arrivals-actions)/update-delete-actions"; // Actions for update/delete
// --- End Corrected Imports ---

import {
  createSecureStorage, // Keep secure storage utils
  isLocalStorageAvailable,
  sanitizeProductData,
} from "../secureStorage";

// Interface for the raw data structure from Prisma/actions
export interface NewArrival {
  id: string;
  name: string;
  price: number;
  rating: number;
  imageUrl: string;
  userId: string; // Keep for sanitization if needed server-side, but will be removed by partialize
  createdAt: Date;
  updatedAt: Date;
  user?: {
    displayName: string;
  };
}

// Define the state structure INCLUDING methods
interface NewArrivalsState {
  newArrivals: NewArrival[];
  isLoading: boolean;
  error: string | null;
  selectedNewArrival: NewArrival | null;
  lastFetched: number | null;
  // Methods
  fetchNewArrivals: () => Promise<void>;
  fetchNewArrivalById: (id: string) => Promise<void>;
  createNewArrival: (formData: FormData) => Promise<boolean>;
  setSelectedNewArrival: (newArrival: NewArrival | null) => void;
  clearError: () => void;
  updateNewArrival: (id: string, formData: FormData) => Promise<boolean>;
  deleteNewArrival: (id: string) => Promise<boolean>;
}

// --- Define the shape of the PARTIAL state that gets persisted ---
// This MUST match what the partialize function returns
type PersistedNewArrivalsState = {
  newArrivals: Omit<NewArrival, "userId">[]; // Persist sanitized items
  lastFetched: number | null;
};

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

// --- Define the store logic using StateCreator ---
// Specify the full state type (NewArrivalsState) and the persisted type (PersistedNewArrivalsState)
const newArrivalsStoreLogic: StateCreator<
  NewArrivalsState,
  [], // Middleware: No zustand built-in middleware like devtools here (applied later)
  [["zustand/persist", PersistedNewArrivalsState]] // Middleware: Persist signature
> = (set, get) => ({
  // Initial state values
  newArrivals: [],
  isLoading: false,
  error: null,
  selectedNewArrival: null,
  lastFetched: null,

  // Actions implementation
  fetchNewArrivals: async () => {
    set({ error: null });
    const currentTime = Date.now();
    const lastFetched = get().lastFetched;
    if (!lastFetched || currentTime - lastFetched > CACHE_DURATION) {
      set({ isLoading: true });
      try {
        const response = await getAction(); // Use get alias
        if (response.success && response.data) {
          set({
            newArrivals: response.data,
            lastFetched: currentTime,
            error: null,
          });
        } else {
          set({ error: response.error || "Failed to fetch new arrivals" });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error";
        set({ error: message });
        console.error("Fetch NA Error:", error);
      } finally {
        set({ isLoading: false });
      }
    }
  },

  fetchNewArrivalById: async (id: string) => {
    set({ error: null });
    const existingItem = get().newArrivals.find((item) => item.id === id);
    if (existingItem) {
      set({ selectedNewArrival: existingItem });
      return;
    }
    set({ isLoading: true });
    try {
      const response = await getByIdAction(id); // Use getById alias
      if (response.success && response.data) {
        set({ selectedNewArrival: response.data, error: null });
      } else {
        set({ error: response.error || "Failed to fetch new arrival" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      set({ error: message });
      console.error("Fetch NA By ID Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createNewArrival: async (formData: FormData): Promise<boolean> => {
    set({ isLoading: true, error: null });
    let success = false;
    try {
      const response = await createAction(formData); // Use create alias
      if (response.success && response.data) {
        set((state) => ({
          newArrivals: [...state.newArrivals, response.data],
          lastFetched: Date.now(),
          error: null,
        }));
        success = true;
      } else {
        set({ error: response.error || "Failed to create new arrival" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      set({ error: message });
      console.error("Create NA Error:", error);
    } finally {
      set({ isLoading: false });
    }
    return success;
  },

  updateNewArrival: async (
    id: string,
    formData: FormData,
  ): Promise<boolean> => {
    set({ isLoading: true, error: null });
    let success = false;
    try {
      const response = await updateAction(id, formData); // Use update alias
      if (response.success && response.data) {
        set((state) => ({
          newArrivals: state.newArrivals.map((item) =>
            item.id === id ? { ...item, ...response.data } : item,
          ),
          lastFetched: Date.now(),
          error: null,
        }));
        success = true;
      } else {
        set({ error: response.error || "Failed to update new arrival" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      set({ error: message });
      console.error("Update NA Error:", error);
    } finally {
      set({ isLoading: false });
    }
    return success;
  },

  deleteNewArrival: async (id: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    let success = false;
    const originalItems = get().newArrivals;
    set((state) => ({
      newArrivals: state.newArrivals.filter((item) => item.id !== id),
    }));
    try {
      const response = await deleteAction(id); // Use delete alias
      if (response.success) {
        success = true;
        set({ lastFetched: Date.now(), error: null });
      } else {
        set({
          newArrivals: originalItems,
          error: response.error || "Failed to delete new arrival",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error";
      set({ newArrivals: originalItems, error: message });
    } finally {
      set({ isLoading: false });
    }
    return success;
  },

  setSelectedNewArrival: (newArrival: NewArrival | null) => {
    set({ selectedNewArrival: newArrival, error: null });
  },
  clearError: () => {
    set({ error: null });
  },
});

// --- Define Persist Options separately with correct types ---
const persistOptions: PersistOptions<
  NewArrivalsState,
  PersistedNewArrivalsState
> = {
  name: "new-arrivals-storage",
  storage: isLocalStorageAvailable() ? createSecureStorage() : undefined, // Type matches now
  // Partialize function MUST return the PersistedNewArrivalsState shape
  partialize: (state): PersistedNewArrivalsState => ({
    newArrivals: sanitizeProductData(state.newArrivals), // Use the sanitizer helper
    lastFetched: state.lastFetched,
  }),
  onRehydrateStorage: (state) => {
    console.log("Rehydrating new arrivals store");
    return (state, error) => {
      if (error) {
        console.error("Failed to rehydrate new arrivals store:", error);
      }
    };
  },
};

// --- Create the hook using the logic and persist options ---
// Apply persist middleware here
const useNewArrivalsStore = create<NewArrivalsState>()(
  persist(newArrivalsStoreLogic, persistOptions),
);

// --- EXPORT the hook as the default ---
export default useNewArrivalsStore;

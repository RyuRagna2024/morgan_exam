// lib/stores/useCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import React from "react";

// Import each action from its own file
import { addToCart as addToCartAction } from "../_cart-actions/add-to-cart";
import { clearCart as clearCartAction } from "../_cart-actions/clear-cart";
import { updateCartItem as updateCartItemAction } from "../_cart-actions/update-cart";
import { getCartCount as getCartCountAction } from "../_cart-actions/get-cart-count";
import { getCartItems as getCartItemsAction } from "../_cart-actions/get-cart-items";
import { toast } from "sonner"; // Assuming you use sonner for toast notifications

// Define the shape of a cart item with full details
export interface CartItemWithDetails {
  id: string;
  variationId: string;
  quantity: number;
  variation: {
    id: string;
    name: string;
    price: number;
    quantity: number; // Available stock
    imageUrl: string;
    product: {
      id: string;
      productName: string;
      productImgUrl: string;
    };
  };
}

// Define the cart store state
interface CartState {
  items: CartItemWithDetails[];
  itemCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  isInitializing: boolean;
  lastUpdated: number; // Timestamp of last data refresh
  isBackgroundFetching: boolean; // For background data refreshes

  // Direct state setters
  setItems: (items: CartItemWithDetails[]) => void;
  setItemCount: (count: number) => void;
  setLastUpdated: (timestamp: number) => void;

  // Actions
  initializeCart: () => Promise<void>;
  addToCart: (variationId: string, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: (showLoading?: boolean) => Promise<void>;

  // Derived data
  getTotalPrice: () => number;
}

// Create a variable to track initialization across renders/components
let hasInitialized = false;

// Time threshold for data freshness (5 minutes)
const DATA_FRESHNESS_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// Create the cart store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      isLoading: false,
      isInitialized: false,
      isInitializing: false,
      lastUpdated: 0,
      isBackgroundFetching: false,

      // Direct state setters
      setItems: (items) => set({ items }),
      setItemCount: (count) => set({ itemCount: count }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),

      // Initialize cart from server
      initializeCart: async () => {
        // Skip if already initialized or initializing
        if (get().isInitialized || get().isInitializing || hasInitialized)
          return;

        // Set initializing flag to prevent duplicate calls
        set({ isInitializing: true });
        hasInitialized = true;

        try {
          // Only make a request if we don't have cached data or need a refresh
          if (get().items.length === 0) {
            const countResponse = await getCartCountAction();

            if (countResponse.success) {
              set({ itemCount: countResponse.cartItemCount });

              if (countResponse.cartItemCount > 0) {
                const itemsResponse = await getCartItemsAction();

                if (itemsResponse.success) {
                  set({
                    items: itemsResponse.items,
                    lastUpdated: Date.now(),
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to initialize cart:", error);
          // Don't show error toast during initialization
        } finally {
          set({
            isInitializing: false,
            isInitialized: true,
          });
        }
      },

      // Add item to cart - MODIFIED for immediate updates
      addToCart: async (variationId, quantity) => {
        // Ensure cart is initialized
        if (!get().isInitialized) {
          await get().initializeCart();
        }

        set({ isLoading: true });
        try {
          const response = await addToCartAction({ variationId, quantity });

          if (response.success) {
            toast.success(response.message);

            // Immediately update the item count first
            if (response.cartItemCount !== undefined) {
              set({ itemCount: response.cartItemCount });
            }

            // IMPORTANT: Always fetch the latest items after adding to cart
            // Don't use the background refresh - use explicit refresh
            const itemsResponse = await getCartItemsAction();
            if (itemsResponse.success) {
              set({
                items: itemsResponse.items,
                lastUpdated: Date.now(),
              });
            }
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          console.error("Failed to add item to cart:", error);
          toast.error("Failed to add item to cart. Please try again.");
        } finally {
          set({ isLoading: false });
        }
      },

      // Update cart item quantity
      updateCartItem: async (cartItemId, quantity) => {
        const prevItems = [...get().items];

        // Optimistically update UI
        const updatedItems = get().items.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        );

        // If quantity is 0, remove item from local state
        const filteredItems =
          quantity === 0
            ? updatedItems.filter((item) => item.id !== cartItemId)
            : updatedItems;

        const newCount = filteredItems.reduce(
          (total, item) => total + item.quantity,
          0,
        );

        set({
          items: filteredItems,
          itemCount: newCount,
          isLoading: true,
        });

        try {
          const response = await updateCartItemAction({ cartItemId, quantity });

          if (response.success) {
            toast.success(response.message);
            if (response.cartItemCount !== undefined) {
              set({
                itemCount: response.cartItemCount,
                lastUpdated: Date.now(),
              });
            }

            // Fetch the latest items to ensure UI consistency
            const itemsResponse = await getCartItemsAction();
            if (itemsResponse.success) {
              set({
                items: itemsResponse.items,
                lastUpdated: Date.now(),
              });
            }
          } else {
            toast.error(response.message);
            set({ items: prevItems });
            // Refresh in background
            get().refreshCart(false);
          }
        } catch (error) {
          console.error("Failed to update cart item:", error);
          toast.error("Failed to update cart. Please try again.");
          set({ items: prevItems });
        } finally {
          set({ isLoading: false });
        }
      },

      // Remove item from cart (convenience method)
      removeCartItem: async (cartItemId) => {
        await get().updateCartItem(cartItemId, 0);
      },

      // Clear entire cart
      clearCart: async () => {
        const prevItems = [...get().items];
        const prevCount = get().itemCount;

        // Optimistically update UI
        set({
          items: [],
          itemCount: 0,
          isLoading: true,
        });

        try {
          const response = await clearCartAction();

          if (response.success) {
            toast.success(response.message);
            set({ lastUpdated: Date.now() });
          } else {
            toast.error(response.message);
            set({
              items: prevItems,
              itemCount: prevCount,
            });
          }
        } catch (error) {
          console.error("Failed to clear cart:", error);
          toast.error("Failed to clear cart. Please try again.");
          set({
            items: prevItems,
            itemCount: prevCount,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Refresh cart data from server - MODIFIED to be more aggressive on refreshes
      refreshCart: async (showLoading = true) => {
        // Skip if already loading in the foreground
        if (get().isLoading) return;

        // Set loading state only if showLoading is true
        if (showLoading) {
          set({ isLoading: true });
        } else {
          set({ isBackgroundFetching: true });
        }

        try {
          // Always fetch both count and items for consistency
          const [countResponse, itemsResponse] = await Promise.all([
            getCartCountAction(),
            getCartItemsAction(),
          ]);

          if (countResponse.success && itemsResponse.success) {
            set({
              items: itemsResponse.items,
              itemCount: countResponse.cartItemCount,
              lastUpdated: Date.now(),
            });
          }
        } catch (error) {
          console.error("Failed to refresh cart:", error);
          // Don't show error toasts for background refreshes
        } finally {
          if (showLoading) {
            set({ isLoading: false });
          } else {
            set({ isBackgroundFetching: false });
          }
        }
      },

      // Calculate total price of items in cart
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.variation.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "cart-storage",
      // Persist cart data to avoid unnecessary fetches
      partialize: (state) => ({
        itemCount: state.itemCount,
        isInitialized: state.isInitialized,
        lastUpdated: state.lastUpdated,
        // Store the items to avoid fetches when data is fresh
        items: state.items,
      }),
    },
  ),
);

// Optimized hook for cart initialization
export function useCartInitializer() {
  const { initializeCart, isInitialized, isInitializing, refreshCart } =
    useCartStore();

  React.useEffect(() => {
    if (!isInitialized && !isInitializing && !hasInitialized) {
      initializeCart();
    } else if (isInitialized) {
      // If already initialized, do a background refresh
      refreshCart(false);
    }
  }, [initializeCart, isInitialized, isInitializing, refreshCart]);
}

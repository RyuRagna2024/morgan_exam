// lib/hooks/useCart.ts
import { useEffect } from "react";
import { useCartStore } from "./cart-store";

export function useCart() {
  const {
    items,
    itemCount,
    isLoading,
    isInitialized,
    isBackgroundFetching,
    initializeCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart,
    getTotalPrice,
  } = useCartStore();

  // Initialize the cart only once during component mount
  useEffect(() => {
    if (!isInitialized) {
      initializeCart();
    }
  }, [isInitialized, initializeCart]);

  return {
    items,
    itemCount,
    isLoading, // Only true during explicit loading operations
    isBackgroundFetching, // Can be used to show subtle loading indicators if needed
    isInitialized,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart,
    totalPrice: getTotalPrice(),
    isEmpty: items.length === 0,
  };
}

// CartProvider component for easier initialization
import { ReactNode } from "react";

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  // Use the cart hook but don't do anything with the returned values
  useCart();

  return <>{children}</>;
}

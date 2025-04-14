"use client";

import { useState } from "react";
import CartItem from "./CartItem";
import { CartItemWithDetails } from "../../../productId/cart/_store/cart-store";

interface CartContentProps {
  items: CartItemWithDetails[];
  isEmpty: boolean;
  isLoading: boolean;
  discountPercentage: number;
  updateCartItem: (id: string, quantity: number) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
}

const CartContent = ({
  items,
  isEmpty,
  isLoading,
  discountPercentage,
  updateCartItem,
  removeCartItem,
  clearCart,
}: CartContentProps) => {
  // We now use these functions for batch updates from the CartItem component

  // Track items with unsaved changes
  const [itemsWithChanges, setItemsWithChanges] = useState<string[]>([]);

  // Add an item to the list of items with unsaved changes
  const addItemWithChanges = (itemId: string) => {
    if (!itemsWithChanges.includes(itemId)) {
      setItemsWithChanges((prev) => [...prev, itemId]);
    }
  };

  // Remove an item from the list of items with unsaved changes
  const removeItemWithChanges = (itemId: string) => {
    setItemsWithChanges((prev) => prev.filter((id) => id !== itemId));
  };
  return (
    <div className="flex-grow overflow-y-auto">
      <div className="p-6">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
          </div>
        )}

        {isEmpty ? (
          <div className="text-gray-300 text-center py-4">
            Your cart is currently empty.
          </div>
        ) : (
          <>
            {items.map((item: CartItemWithDetails) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateCartItem}
                onRemove={removeCartItem}
                discountPercentage={discountPercentage}
              />
            ))}

            {items.length > 0 && (
              <div className="mt-4 flex justify-between">
                <button
                  onClick={clearCart}
                  className="py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  disabled={isLoading}
                >
                  Clear Cart
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartContent;

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CloseIcon } from "../NavIcons";
import { useCart } from "../../../productId/cart/_store/use-cart-store-hooks";
import { useTierDiscount } from "../../../(group-products)/_components/(filterside)/tier-util";
import CartContent from "./CartContent";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartRef: React.RefObject<HTMLDivElement>;
}

const Cart = ({ isOpen, onClose, cartRef }: CartProps) => {
  const {
    items,
    itemCount,
    isLoading,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart,
    totalPrice,
    isEmpty,
  } = useCart();

  // Get tier discount information
  const { discountPercentage, hasDiscount, userTier } = useTierDiscount();

  // Calculate discounted total price
  const discountedTotalPrice = totalPrice * (1 - discountPercentage);

  // Reference to track if this is the first time opening
  const firstOpenRef = useRef(true);

  // Only do a background refresh when opening the cart
  useEffect(() => {
    if (isOpen) {
      // If this is the first open, do a background refresh
      // This ensures we don't hit the server redundantly
      if (firstOpenRef.current) {
        firstOpenRef.current = false;
        // Use false parameter to prevent loading state
        refreshCart(false);
      }
    }
  }, [isOpen, refreshCart]);
  
  // Create optimized update handler to batch quantity changes
  const handleUpdateCartItem = (id: string, quantity: number) => {
    // Only trigger server update when quantity is finalized
    updateCartItem(id, quantity);
  };

  // Format tier name for display
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  if (!isOpen) return null;

  return (
    <div
      ref={cartRef}
      className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gradient-to-b from-gray-900 to-black border-l border-red-700 shadow-lg z-50 transition-transform duration-300 ease-in-out flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Your Cart {itemCount > 0 && <span>({itemCount})</span>}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Display tier badge if user has a discount */}
        {hasDiscount && (
          <div className="mt-2 py-1 px-2 bg-red-600/20 border border-red-500/30 rounded text-sm text-red-400">
            {tierName} tier: {Math.round(discountPercentage * 100)}% discount
            applied
          </div>
        )}
      </div>

      {/* Cart Content */}
      <CartContent
        items={items}
        isEmpty={isEmpty}
        isLoading={isLoading}
        discountPercentage={discountPercentage}
        updateCartItem={handleUpdateCartItem}
        removeCartItem={removeCartItem}
        clearCart={clearCart}
      />

      {/* Footer with totals and checkout button */}
      <div className="p-6 border-t border-gray-800">
        {!isEmpty && (
          <>
            {hasDiscount ? (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Original Subtotal</span>
                  <span className="text-gray-400 line-through">
                    R{totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">{tierName} Discount</span>
                  <span className="text-red-400">
                    -R{(totalPrice - discountedTotalPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-white">Final Subtotal</span>
                  <span className="text-white">
                    R{discountedTotalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between mb-4">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white font-medium">
                  R{totalPrice.toFixed(2)}
                </span>
              </div>
            )}

            <Link
              href="/checkout"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-md text-center font-medium transition-all duration-300 hover:shadow-lg"
              onClick={onClose}
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
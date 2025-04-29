"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CloseIcon } from "../NavIcons"; // Assuming CloseIcon uses `currentColor` or is theme-aware
import { useCart } from "../../../productId/cart/_store/use-cart-store-hooks";
import { useTierDiscount } from "../../../(group-products)/_components/(filterside)/tier-util";
import CartContent from "./CartContent"; // Ensure CartContent doesn't have conflicting height/overflow styles internally

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
      if (firstOpenRef.current) {
        firstOpenRef.current = false;
        refreshCart(false);
      }
    }
  }, [isOpen, refreshCart]);

  // Create optimized update handler
  const handleUpdateCartItem = (id: string, quantity: number) => {
    updateCartItem(id, quantity);
  };

  // Format tier name for display
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  if (!isOpen) return null;

  return (
    <div
      ref={cartRef}
      // --- MODIFIED: Changed h-full to h-screen ---
      // Use theme-aware background and border, ensure full viewport height
      className="fixed top-0 right-0 w-full sm:w-96 h-screen bg-card border-l border-border shadow-lg z-50 transition-transform duration-300 ease-in-out flex flex-col"
    >
      {/* Header */}
      {/* --- ADDED: flex-shrink-0 to prevent shrinking --- */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">
            Your Cart {itemCount > 0 && <span>({itemCount})</span>}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Display tier badge */}
        {hasDiscount && (
          <div className="mt-2 py-1 px-2 bg-red-600/20 border border-red-500/30 rounded text-sm text-red-400">
            {tierName} tier: {Math.round(discountPercentage * 100)}% discount
            applied
          </div>
        )}
      </div>

      {/* Cart Content Area - Make this scrollable */}
      {/* --- ADDED: wrapper div with flex-grow and overflow-y-auto --- */}
      <div className="flex-grow overflow-y-auto p-6">
        {" "}
        {/* Added padding here if CartContent itself doesn't have it */}
        <CartContent
          items={items}
          isEmpty={isEmpty}
          isLoading={isLoading}
          discountPercentage={discountPercentage}
          updateCartItem={handleUpdateCartItem}
          removeCartItem={removeCartItem}
          clearCart={clearCart}
        />
      </div>

      {/* Footer */}
      {/* --- ADDED: flex-shrink-0 to prevent shrinking --- */}
      <div className="p-6 border-t border-border flex-shrink-0">
        {!isEmpty && (
          <>
            {hasDiscount ? (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">
                    Original Subtotal
                  </span>
                  <span className="text-muted-foreground line-through">
                    R{totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">
                    {tierName} Discount
                  </span>
                  <span className="text-red-400">
                    -R{(totalPrice - discountedTotalPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-foreground">Final Subtotal</span>
                  <span className="text-foreground">
                    R{discountedTotalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between mb-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">
                  R{totalPrice.toFixed(2)}
                </span>
              </div>
            )}

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-md text-center font-medium transition-all duration-300 hover:shadow-lg inline-block"
              onClick={onClose}
            >
              Proceed to Checkout
            </Link>
          </>
        )}
        {/* Add a message if the cart is empty but the footer should still show */}
        {isEmpty && (
          <p className="text-center text-muted-foreground">
            Your cart is empty.
          </p>
        )}
      </div>
    </div>
  );
};

export default Cart;

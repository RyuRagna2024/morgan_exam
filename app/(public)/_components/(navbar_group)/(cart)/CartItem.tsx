"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CartItemWithDetails } from "../../../productId/cart/_store/cart-store";

interface CartItemProps {
  item: CartItemWithDetails;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  discountPercentage: number;
}

const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  discountPercentage,
}: CartItemProps) => {
  const originalPrice = item.variation.price;
  const discountedPrice = originalPrice * (1 - discountPercentage);
  const hasDiscount = discountPercentage > 0;

  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [inputMode, setInputMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const incrementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decrementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (incrementTimerRef.current) clearInterval(incrementTimerRef.current);
      if (decrementTimerRef.current) clearInterval(decrementTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasChangedRef.current) {
      setLocalQuantity(item.quantity);
    }
  }, [item.quantity]);

  const handleSaveChanges = () => {
    if (localQuantity !== item.quantity) {
      if (localQuantity === 0) {
        onRemove(item.id);
      } else {
        onUpdateQuantity(item.id, localQuantity);
      }
      hasChangedRef.current = false; // Reset after saving
      setHasUnsavedChanges(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      const newQuantity = Math.min(value, item.variation.quantity);
      setLocalQuantity(newQuantity);
      hasChangedRef.current = true;
      setHasUnsavedChanges(newQuantity !== item.quantity);
    } else if (e.target.value === "") {
      setLocalQuantity(0); // Allow setting to 0 temporarily
      hasChangedRef.current = true;
      setHasUnsavedChanges(0 !== item.quantity);
    }
  };

  const handleInputBlur = () => {
    setInputMode(false);
    // Save changes on blur if they exist
    if (hasUnsavedChanges) {
      handleSaveChanges();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission if applicable
      handleInputBlur(); // Save on Enter
    } else if (e.key === "Escape") {
      setLocalQuantity(item.quantity); // Revert changes
      setInputMode(false);
      hasChangedRef.current = false;
      setHasUnsavedChanges(false);
    }
  };

  const handleIncrementStart = () => {
    if (localQuantity < item.variation.quantity) {
      const newQuantity = localQuantity + 1;
      setLocalQuantity(newQuantity);
      hasChangedRef.current = true;
      setHasUnsavedChanges(newQuantity !== item.quantity);

      incrementTimerRef.current = setInterval(() => {
        setLocalQuantity((prev) => {
          const newValue = Math.min(prev + 1, item.variation.quantity);
          if (
            newValue === item.variation.quantity &&
            incrementTimerRef.current
          ) {
            clearInterval(incrementTimerRef.current);
          }
          hasChangedRef.current = true;
          setHasUnsavedChanges(newValue !== item.quantity);
          return newValue;
        });
      }, 150);
    }
  };

  const handleDecrementStart = () => {
    // Allow decrementing down to 0 if input mode allows it, otherwise stop at 1
    const minQuantity = 1; // Change to 0 if you want to allow removing via buttons
    if (localQuantity > minQuantity) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      hasChangedRef.current = true;
      setHasUnsavedChanges(newQuantity !== item.quantity);

      decrementTimerRef.current = setInterval(() => {
        setLocalQuantity((prev) => {
          const newValue = Math.max(prev - 1, minQuantity);
          if (newValue === minQuantity && decrementTimerRef.current) {
            clearInterval(decrementTimerRef.current);
          }
          hasChangedRef.current = true;
          setHasUnsavedChanges(newValue !== item.quantity);
          return newValue;
        });
      }, 150);
    }
  };

  const handleButtonStop = () => {
    if (incrementTimerRef.current) {
      clearInterval(incrementTimerRef.current);
      incrementTimerRef.current = null;
    }
    if (decrementTimerRef.current) {
      clearInterval(decrementTimerRef.current);
      decrementTimerRef.current = null;
    }
    // Update unsaved changes status after button interaction stops
    setHasUnsavedChanges(localQuantity !== item.quantity);
    // Trigger save immediately after button release if configured
    // if (hasUnsavedChanges) { handleSaveChanges(); }
  };

  return (
    // --- REFACTORED: Use theme-aware border ---
    <div className="flex gap-4 py-4 border-b border-border">
      {/* --- REFACTORED: Use theme-aware background --- */}
      <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden">
        {item.variation.imageUrl ? (
          <Image
            src={item.variation.imageUrl}
            alt={item.variation.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : item.variation.product.productImgUrl ? (
          <Image
            src={item.variation.product.productImgUrl}
            alt={item.variation.product.productName}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          // --- REFACTORED: Use theme-aware background and text ---
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
            No Image
          </div>
        )}
      </div>

      <div className="flex-grow">
        <Link
          href={`/products/${item.variation.product.id}`}
          // --- REFACTORED: Use theme-aware text and hover (using primary color) ---
          className="text-foreground hover:text-primary font-medium transition-colors"
        >
          {item.variation.product.productName}
        </Link>
        {/* --- REFACTORED: Use theme-aware text --- */}
        <p className="text-sm text-muted-foreground">{item.variation.name}</p>
        <div className="mt-2 flex justify-between items-center">
          {hasDiscount ? (
            <div>
              {/* Kept red text for emphasis - ensure contrast */}
              <div className="text-red-400">R{discountedPrice.toFixed(2)}</div>
              {/* --- REFACTORED: Use theme-aware text --- */}
              <div className="text-xs text-muted-foreground line-through">
                R{originalPrice.toFixed(2)}
              </div>
            </div>
          ) : (
            // Kept red text for emphasis - ensure contrast
            <div className="text-red-400">R{originalPrice.toFixed(2)}</div>
          )}

          <div className="flex items-center gap-2">
            <button
              onMouseDown={handleDecrementStart}
              onMouseUp={handleButtonStop}
              onMouseLeave={handleButtonStop}
              onTouchStart={handleDecrementStart}
              onTouchEnd={handleButtonStop}
              disabled={localQuantity <= 1} // Adjust if allowing 0
              // --- REFACTORED: Use theme-aware border, text and hover ---
              className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
              title="Decrease quantity (hold to decrease faster)"
            >
              -
            </button>

            {inputMode ? (
              <div className="relative">
                <label
                  htmlFor={`quantity-input-${item.id}`}
                  className="sr-only"
                >
                  Product quantity
                </label>
                <input
                  id={`quantity-input-${item.id}`}
                  type="number" // Use number type for better mobile experience
                  value={localQuantity}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Qty"
                  aria-label="Product quantity"
                  min="0" // Allow 0 if needed for removal logic via input
                  max={item.variation.quantity}
                  // --- REFACTORED: Use theme-aware bg, text, border, focus ---
                  className="w-12 bg-input text-foreground text-center border border-border rounded focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary px-1"
                  autoFocus
                />
              </div>
            ) : (
              <span
                // --- REFACTORED: Use theme-aware text and hover ---
                className="w-8 text-center text-foreground cursor-pointer hover:text-primary"
                onClick={() => setInputMode(true)}
                title="Click to edit quantity"
                role="button"
                tabIndex={0}
                aria-label={`Quantity: ${localQuantity}. Click to edit`}
                onKeyDown={(e) => e.key === "Enter" && setInputMode(true)}
              >
                {localQuantity}
              </span>
            )}

            <button
              onMouseDown={handleIncrementStart}
              onMouseUp={handleButtonStop}
              onMouseLeave={handleButtonStop}
              onTouchStart={handleIncrementStart}
              onTouchEnd={handleButtonStop}
              disabled={localQuantity >= item.variation.quantity}
              // --- REFACTORED: Use theme-aware border, text and hover ---
              className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
              title="Increase quantity (hold to increase faster)"
            >
              +
            </button>

            <button
              onClick={() => onRemove(item.id)}
              // --- REFACTORED: Use theme-aware text, keep red hover for destructive action ---
              className="ml-3 text-muted-foreground hover:text-red-500 transition-colors"
              // Alternative: use destructive theme color
              // className="ml-3 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove item"
            >
              {/* Simple Trash Icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Update Cart Button */}
        {hasUnsavedChanges && (
          <div className="mt-2 text-right">
            {/* Kept red for emphasis - ensure contrast */}
            {/* Alternative: Use primary theme color */}
            {/* <button
              onClick={handleSaveChanges}
              className="px-3 py-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
            >
              Update Cart
            </button> */}
            <button
              onClick={handleSaveChanges}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Update Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;

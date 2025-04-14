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
  // Calculate discounted price
  const originalPrice = item.variation.price;
  const discountedPrice = originalPrice * (1 - discountPercentage);
  const hasDiscount = discountPercentage > 0;

  // Local state to track quantity before sending to server
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [inputMode, setInputMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Timer refs for button hold functionality
  const incrementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decrementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangedRef = useRef(false);

  // Clear any active timers when unmounting
  useEffect(() => {
    return () => {
      if (incrementTimerRef.current) clearInterval(incrementTimerRef.current);
      if (decrementTimerRef.current) clearInterval(decrementTimerRef.current);
    };
  }, []);

  // Update local quantity when item quantity changes from props
  useEffect(() => {
    if (!hasChangedRef.current) {
      setLocalQuantity(item.quantity);
    }
  }, [item.quantity]);

  // Handle saving changes to the server
  const handleSaveChanges = () => {
    if (localQuantity !== item.quantity) {
      if (localQuantity === 0) {
        onRemove(item.id);
      } else {
        onUpdateQuantity(item.id, localQuantity);
      }
      setHasUnsavedChanges(false);
    }
  };

  // Handle manual input change
  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      const newQuantity = Math.min(value, item.variation.quantity);
      setLocalQuantity(newQuantity);
      hasChangedRef.current = true;
      setHasUnsavedChanges(newQuantity !== item.quantity);
    } else if (e.target.value === "") {
      setLocalQuantity(0);
      hasChangedRef.current = true;
      setHasUnsavedChanges(0 !== item.quantity);
    }
  };

  // Handle input blur - only update local state, don't send to server
  const handleInputBlur = () => {
    setInputMode(false);
  };

  // Handle key press events (Enter and Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setLocalQuantity(item.quantity);
      setInputMode(false);
      hasChangedRef.current = false;
      setHasUnsavedChanges(false);
    }
  };

  // Handle increment with button hold functionality
  const handleIncrementStart = () => {
    if (localQuantity < item.variation.quantity) {
      const newQuantity = localQuantity + 1;
      setLocalQuantity(newQuantity);
      hasChangedRef.current = true;
      setHasUnsavedChanges(newQuantity !== item.quantity);

      // Start auto-increment after holding the button
      incrementTimerRef.current = setInterval(() => {
        setLocalQuantity((prev) => {
          const newValue = prev + 1;
          if (newValue >= item.variation.quantity) {
            if (incrementTimerRef.current)
              clearInterval(incrementTimerRef.current);
            return item.variation.quantity;
          }
          hasChangedRef.current = true;
          setHasUnsavedChanges(newValue !== item.quantity);
          return newValue;
        });
      }, 150); // Adjust speed of auto-increment
    }
  };

  // Handle decrement with button hold functionality
  const handleDecrementStart = () => {
    if (localQuantity > 1) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      hasChangedRef.current = true;
      setHasUnsavedChanges(newQuantity !== item.quantity);

      // Start auto-decrement after holding the button
      decrementTimerRef.current = setInterval(() => {
        setLocalQuantity((prev) => {
          const newValue = prev - 1;
          if (newValue <= 1) {
            if (decrementTimerRef.current)
              clearInterval(decrementTimerRef.current);
            return 1;
          }
          hasChangedRef.current = true;
          setHasUnsavedChanges(newValue !== item.quantity);
          return newValue;
        });
      }, 150); // Adjust speed of auto-decrement
    }
  };

  // Stop increment/decrement when button is released
  const handleButtonStop = () => {
    if (incrementTimerRef.current) {
      clearInterval(incrementTimerRef.current);
      incrementTimerRef.current = null;
    }

    if (decrementTimerRef.current) {
      clearInterval(decrementTimerRef.current);
      decrementTimerRef.current = null;
    }

    // Update the hasUnsavedChanges state based on actual difference
    setHasUnsavedChanges(localQuantity !== item.quantity);
  };

  return (
    <div className="flex gap-4 py-4 border-b border-gray-700">
      <div className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="flex-grow">
        <Link
          href={`/products/${item.variation.product.id}`}
          className="text-white hover:text-red-400 font-medium transition-colors"
        >
          {item.variation.product.productName}
        </Link>
        <p className="text-sm text-gray-400">{item.variation.name}</p>
        <div className="mt-2 flex justify-between items-center">
          {hasDiscount ? (
            <div>
              <div className="text-red-400">R{discountedPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-500 line-through">
                R{originalPrice.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="text-red-400">R{originalPrice.toFixed(2)}</div>
          )}

          <div className="flex items-center gap-2">
            <button
              onMouseDown={handleDecrementStart}
              onMouseUp={handleButtonStop}
              onMouseLeave={handleButtonStop}
              onTouchStart={handleDecrementStart}
              onTouchEnd={handleButtonStop}
              disabled={localQuantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-600 text-gray-300 hover:border-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                  type="text"
                  value={localQuantity}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Qty"
                  aria-label="Product quantity"
                  className="w-12 bg-gray-800 text-white text-center border border-gray-600 rounded focus:border-red-500 focus:outline-none px-1"
                  autoFocus
                />
              </div>
            ) : (
              <span
                className="w-8 text-center text-white cursor-pointer hover:text-red-400"
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
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-600 text-gray-300 hover:border-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
              title="Increase quantity (hold to increase faster)"
            >
              +
            </button>

            <button
              onClick={() => onRemove(item.id)}
              className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove item"
            >
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

        {/* Update Cart Button - only shown when changes have been made */}
        {hasUnsavedChanges && (
          <div className="mt-2 text-right">
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

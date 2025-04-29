// app/(public)/productId/[product_id]/_components/VariationSelector.tsx
"use client";

import { useMemo } from "react";
import ColorSwatch from "./ColorSwatch";
import { cn } from "@/lib/utils";

// Variation interface (ensure consistency)
interface Variation {
  id: string;
  name: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface VariationSelectorProps {
  variations: Variation[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  currentVariation: Variation | null;
}

const VariationSelector = ({
  variations,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
  currentVariation,
}: VariationSelectorProps) => {
  // Get unique colors available across all variations
  const colors = useMemo(() => {
    const colorSet = new Set<string>();
    variations.forEach((v) => colorSet.add(v.color));
    return Array.from(colorSet);
  }, [variations]);

  // Get unique sizes available FOR THE CURRENTLY SELECTED color
  const availableSizes = useMemo(() => {
    if (!selectedColor) return [];
    const sizeSet = new Set<string>();
    variations.forEach((v) => {
      if (v.color === selectedColor) {
        sizeSet.add(v.size);
      }
    });
    return Array.from(sizeSet);
  }, [variations, selectedColor]);

  // Determine if a specific size button should be disabled
  const isSizeDisabled = (size: string): boolean => {
    if (!selectedColor) return true;
    const variationExists = variations.find(
      (v) => v.color === selectedColor && v.size === size,
    );
    return !variationExists; //|| variationExists.quantity <= 0; // Uncomment to disable out-of-stock
  };

  return (
    <div className="space-y-4">
      {/* Colors Section */}
      <div>
        <label
          id="color-label"
          className="text-sm font-medium mb-2 block text-foreground"
        >
          Color:{" "}
          <span className="text-muted-foreground">
            {selectedColor || "Select a color"}
          </span>
        </label>
        <div aria-labelledby="color-label" className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              selected={selectedColor === color}
              onClick={() => onColorSelect(color)}
              // Assume ColorSwatch handles its own selected state visually/semantically
            />
          ))}
        </div>
      </div>

      {/* Sizes Section - Only show if a color is selected */}
      {selectedColor && (
        <div>
          <label
            id="size-label"
            className="text-sm font-medium mb-2 block text-foreground"
          >
            Size:{" "}
            <span className="text-muted-foreground">
              {selectedSize || "Select a size"}
            </span>
          </label>
          <div aria-labelledby="size-label" className="flex flex-wrap gap-2">
            {availableSizes.length > 0 ? (
              availableSizes.map((size) => {
                const isDisabled = isSizeDisabled(size);
                return (
                  <button
                    key={size}
                    type="button"
                    // --- REMOVED aria-checked attribute ---
                    disabled={isDisabled}
                    className={cn(
                      "px-3 py-1 border rounded text-sm transition-colors duration-150 ease-in-out",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-background",
                      selectedSize === size
                        ? "bg-primary text-primary-foreground border-primary" // Selected style
                        : isDisabled
                          ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed" // Disabled style
                          : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground", // Default/hover style
                    )}
                    onClick={() => !isDisabled && onSizeSelect(size)} // Prevent click if disabled
                  >
                    {size}
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No sizes available for selected color.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stock info */}
      {currentVariation && (
        <div className="mt-3 text-sm">
          <p
            className={cn(
              "font-medium",
              currentVariation.quantity > 0
                ? "text-green-600 dark:text-green-500"
                : "text-destructive",
            )}
          >
            {currentVariation.quantity > 0
              ? `In Stock (${currentVariation.quantity} available)`
              : "Out of Stock"}
          </p>
          <p className="text-muted-foreground text-xs mt-0.5">
            SKU: {currentVariation.sku}
          </p>
        </div>
      )}
    </div>
  );
};

export default VariationSelector;

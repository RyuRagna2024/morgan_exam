// app/(public)/productId/[product_id]/_components/VariationSelector.tsx
"use client";

import { useMemo } from "react";
import ColorSwatch from "./ColorSwatch"; // Assuming ColorSwatch handles its own dark mode ok
import { cn } from "@/lib/utils"; // Import cn

// Keep Variation type definition or import it
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
  // Get unique colors
  const colors = useMemo(
    () => [...new Set(variations.map((v) => v.color))],
    [variations],
  );

  // Get sizes available for the selected color
  const availableSizes = useMemo(() => {
    if (!selectedColor) return [];
    return variations
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size)
      .filter((size, index, self) => self.indexOf(size) === index);
  }, [variations, selectedColor]);

  return (
    <div className="space-y-4">
      {" "}
      {/* Increased spacing */}
      {/* Colors */}
      <div>
        {/* Use theme text color */}
        <h3 className="text-sm font-medium mb-2 text-foreground">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              selected={selectedColor === color}
              onClick={() => onColorSelect(color)}
            />
          ))}
        </div>
      </div>
      {/* Sizes */}
      <div>
        {/* Use theme text color */}
        <h3 className="text-sm font-medium mb-2 text-foreground">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button // Use button for better semantics/focus
              key={size}
              type="button"
              className={cn(
                // Use cn for conditional classes
                "px-3 py-1 border rounded text-sm cursor-pointer transition-colors duration-150 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-background", // Focus styles
                selectedSize === size
                  ? "bg-primary text-primary-foreground border-primary" // Selected styles
                  : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground", // Default/hover styles
              )}
              onClick={() => onSizeSelect(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      {/* Stock info */}
      {currentVariation && (
        <div className="my-3 text-sm">
          <p
            className={cn(
              // Use cn for dynamic class
              currentVariation.quantity > 0
                ? "text-green-600 dark:text-green-500" // Dark mode green
                : "text-destructive dark:text-destructive", // Use destructive theme color
            )}
          >
            {currentVariation.quantity > 0
              ? `In Stock (${currentVariation.quantity} available)`
              : "Out of Stock"}
          </p>
          {/* Use muted foreground */}
          <p className="text-muted-foreground">SKU: {currentVariation.sku}</p>
        </div>
      )}
    </div>
  );
};

export default VariationSelector;

"use client";

import { useMemo } from "react";
import ColorSwatch from "./ColorSwatch";

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
  const colors = useMemo(() => {
    return [...new Set(variations.map((v) => v.color))];
  }, [variations]);

  // Get sizes available for the selected color
  const availableSizes = useMemo(() => {
    if (!selectedColor) return [];

    return variations
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size)
      .filter((size, index, self) => self.indexOf(size) === index);
  }, [variations, selectedColor]);

  return (
    <div className="space-y-3">
      {/* Colors */}
      <div>
        <h3 className="text-sm font-medium mb-1">Colors</h3>
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
        <h3 className="text-sm font-medium mb-1">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <div
              key={size}
              className={`px-3 py-1 border rounded text-sm cursor-pointer ${
                selectedSize === size
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onSizeSelect(size)}
            >
              {size}
            </div>
          ))}
        </div>
      </div>

      {/* Stock info */}
      {currentVariation && (
        <div className="my-3 text-sm">
          <p
            className={
              currentVariation.quantity > 0 ? "text-green-600" : "text-red-600"
            }
          >
            {currentVariation.quantity > 0
              ? `In Stock (${currentVariation.quantity} available)`
              : "Out of Stock"}
          </p>
          <p className="text-gray-500">SKU: {currentVariation.sku}</p>
        </div>
      )}
    </div>
  );
};

export default VariationSelector;

// app/(public)/(group-products)/(unviresal_comp)/Card.tsx

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { formatCurrency } from "./utils";
import { Variation } from "../_components/(filterside)/types";
import { useTierDiscount } from "../_components/(filterside)/tier-util";

interface ProductCardProps {
  id: string;
  productName: string;
  category: string[];
  productImgUrl: string;
  description: string;
  sellingPrice: number;
  variations?: Variation[]; // Add variations to the props interface
}

export const ProductCard = ({
  productName,
  category,
  productImgUrl,
  description,
  sellingPrice,
  variations = [], // Set default to empty array
}: ProductCardProps) => {
  // Get first variation with image if available
  const primaryVariation = variations.length > 0 ? variations[0] : null;
  // Always use the product's main image for the card
  const displayImage = productImgUrl;

  // Get tier discount information
  const { hasDiscount, calculatePrice, userTier, discountPercentage } =
    useTierDiscount();

  // Calculate the discounted price
  const discountedPrice = calculatePrice(sellingPrice);

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={displayImage}
            alt={productName}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 640px) 100vw, 
                   (max-width: 768px) 50vw,
                   (max-width: 1024px) 33vw,
                   25vw"
          />

          {/* Display discount badge if user has a discount */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              {Math.round(discountPercentage * 100)}% OFF
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{productName}</h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {category.map((cat) => (
            <span
              key={cat}
              className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        {/* Display variation information if available */}
        {variations.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Available options:</p>

            {/* Show sizes */}
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium">Sizes:</span>
              <div className="flex flex-wrap gap-1">
                {[...new Set(variations.map((v) => v.size))]
                  .slice(0, 4)
                  .map((size) => (
                    <span
                      key={size}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {size}
                    </span>
                  ))}
                {[...new Set(variations.map((v) => v.size))].length > 4 && (
                  <span className="text-xs text-gray-500">+more</span>
                )}
              </div>
            </div>

            {/* Show colors */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Colors:</span>
              <div className="flex flex-wrap gap-1">
                {[...new Set(variations.map((v) => v.color))]
                  .slice(0, 4)
                  .map((color) => (
                    <span
                      key={color}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {color}
                    </span>
                  ))}
                {[...new Set(variations.map((v) => v.color))].length > 4 && (
                  <span className="text-xs text-gray-500">+more</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {hasDiscount ? (
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(discountedPrice)}
            </p>
            <p className="text-sm text-gray-500 line-through">
              {formatCurrency(sellingPrice)}
            </p>
            <span className="text-xs text-gray-600 ml-1">
              {userTier.charAt(0) + userTier.slice(1).toLowerCase()} price
            </span>
          </div>
        ) : (
          <p className="text-lg font-bold text-primary">
            {formatCurrency(sellingPrice)}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

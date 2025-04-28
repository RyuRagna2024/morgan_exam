// app/(public)/(group-products)/(unviresal_comp)/Card.tsx

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"; // Use Shadcn Card
import Image from "next/image";
import { formatCurrency } from "./utils";
import { Variation } from "../_components/(filterside)/types";
import { useTierDiscount } from "../_components/(filterside)/tier-util";
import { cn } from "@/lib/utils"; // Import cn

interface ProductCardProps {
  id: string;
  productName: string;
  category: string[];
  productImgUrl: string;
  description: string;
  sellingPrice: number;
  variations?: Variation[];
}

export const ProductCard = ({
  productName,
  category,
  productImgUrl,
  description,
  sellingPrice,
  variations = [],
}: ProductCardProps) => {
  const primaryVariation = variations.length > 0 ? variations[0] : null;
  const displayImage = productImgUrl;

  const { hasDiscount, calculatePrice, userTier, discountPercentage } =
    useTierDiscount();
  const discountedPrice = calculatePrice(sellingPrice);

  return (
    // Card already uses theme variables
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 ease-in-out overflow-hidden group">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden">
          {" "}
          {/* Added overflow-hidden */}
          <Image
            src={displayImage}
            alt={productName}
            fill
            className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300 ease-in-out" // Added zoom effect
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" // Adjusted sizes
          />
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
              {Math.round(discountPercentage * 100)}% OFF
            </div>
          )}
        </div>
      </CardHeader>
      {/* CardContent text should inherit from Card */}
      <CardContent className="flex-grow p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{productName}</h3>
        {/* Category tags with dark mode */}
        <div className="flex flex-wrap gap-1 mb-2">
          {category.map((cat) => (
            <span
              key={cat}
              className={cn(
                // Use cn
                "text-xs px-2 py-0.5 rounded-full",
                "bg-muted text-muted-foreground border border-border", // Use theme variables
              )}
            >
              {cat}
            </span>
          ))}
        </div>
        {/* Description text with dark mode */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Variation info with dark mode */}
        {variations.length > 0 && (
          <div className="mt-2">
            {/* Use muted-foreground */}
            <p className="text-xs text-muted-foreground mb-1">
              Available options:
            </p>

            {/* Show sizes */}
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium text-foreground">
                Sizes:
              </span>
              <div className="flex flex-wrap gap-1">
                {[...new Set(variations.map((v) => v.size))]
                  .slice(0, 4)
                  .map((size) => (
                    <span
                      key={size}
                      className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                    >
                      {size}
                    </span>
                  ))}
                {[...new Set(variations.map((v) => v.size))].length > 4 && (
                  <span className="text-xs text-muted-foreground">+more</span>
                )}
              </div>
            </div>

            {/* Show colors */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-foreground">
                Colors:
              </span>
              <div className="flex flex-wrap gap-1">
                {[...new Set(variations.map((v) => v.color))]
                  .slice(0, 4)
                  .map((color) => (
                    <span
                      key={color}
                      className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                    >
                      {color}
                    </span>
                  ))}
                {[...new Set(variations.map((v) => v.color))].length > 4 && (
                  <span className="text-xs text-muted-foreground">+more</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {/* Footer text colors */}
      <CardFooter className="p-4 pt-0">
        {hasDiscount ? (
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-red-600 dark:text-red-500">
              {" "}
              {/* Dark mode accent */}
              {formatCurrency(discountedPrice)}
            </p>
            <p className="text-sm text-muted-foreground line-through">
              {" "}
              {/* Use muted */}
              {formatCurrency(sellingPrice)}
            </p>
            <span className="text-xs text-muted-foreground ml-1">
              {" "}
              {/* Use muted */}
              {userTier.charAt(0) + userTier.slice(1).toLowerCase()} price
            </span>
          </div>
        ) : (
          <p className="text-lg font-bold text-foreground">
            {" "}
            {/* Use foreground */}
            {formatCurrency(sellingPrice)}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

// app/(public)/productId/[product_id]/_components/ProductImage.tsx
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils"; // Import cn

interface ProductImageProps {
  imageUrl: string;
  productName: string;
}

const ProductImage = ({ imageUrl, productName }: ProductImageProps) => {
  return (
    // Added theme background with slight opacity as fallback
    <div
      className={cn(
        "bg-muted/30 dark:bg-muted/10", // Use muted background
        "rounded overflow-hidden relative aspect-square mb-4",
      )}
    >
      <Image
        src={imageUrl}
        alt={productName}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        className="object-contain p-2" // Add padding if needed for contain
      />
    </div>
  );
};

export default ProductImage;

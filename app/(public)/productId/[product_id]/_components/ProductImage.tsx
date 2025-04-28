// app/(public)/productId/[product_id]/_components/ProductImage.tsx
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  imageUrl: string;
  productName: string;
}

const ProductImage = ({ imageUrl, productName }: ProductImageProps) => {
  return (
    // --- Restore aspect-square ---
    <div
      className={cn(
        "bg-muted/30 dark:bg-muted/10",
        "rounded overflow-hidden relative w-full aspect-square", // Use aspect-square again
      )}
    >
      <Image
        src={imageUrl}
        alt={productName}
        fill
        sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 30vw"
        priority
        // Use contain to prevent cropping within the square
        className="object-contain p-4" // Keep padding
      />
    </div>
  );
};

export default ProductImage;

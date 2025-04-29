// app/(public)/productId/[product_id]/_components/ImageThumbnailSelector.tsx
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Variation { // Ensure this matches your actual Variation type/interface
  id: string;
  name: string;
  imageUrl: string;
  // Add other fields if needed for display logic
}

interface ImageThumbnailSelectorProps {
  variations: Variation[];
  productImageUrl: string; // Main product image
  selectedImageUrl: string | null;
  onImageSelect: (imageUrl: string) => void;
}

const ImageThumbnailSelector = ({
  variations,
  productImageUrl,
  selectedImageUrl,
  onImageSelect,
}: ImageThumbnailSelectorProps) => {
  // Combine main image and variation images for the gallery
  const galleryImages = [
    { id: "main", imageUrl: productImageUrl, name: "Main View" }, // Add main image as first option
    ...variations.map(v => ({ id: v.id, imageUrl: v.imageUrl, name: v.name || `View ${v.id}` })), // Use variation name or ID
  ];

  // Determine the currently selected URL (could be main or a variation)
  const currentSelected = selectedImageUrl ?? productImageUrl;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {galleryImages.map((imageInfo) => (
        <button
          key={imageInfo.id}
          type="button"
          onClick={() => onImageSelect(imageInfo.imageUrl)}
          className={cn(
            "relative h-16 w-16 rounded border overflow-hidden cursor-pointer transition-all duration-150 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-background",
            currentSelected === imageInfo.imageUrl
              ? "border-primary ring-2 ring-primary ring-offset-1 dark:ring-offset-background" // Selected style
              : "border-border hover:border-muted-foreground" // Default style
          )}
          aria-label={`View ${imageInfo.name}`}
        >
          <Image
            src={imageInfo.imageUrl}
            alt={imageInfo.name}
            fill
            sizes="(max-width: 768px) 10vw, 5vw" // Adjust sizes as needed
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
};

export default ImageThumbnailSelector;
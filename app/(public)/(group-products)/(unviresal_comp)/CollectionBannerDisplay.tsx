// app/(public)/(group-products)/_components/CollectionBannerDisplay.tsx
"use client"; // Needs to be client if using next/image with complex props/state

import Image from "next/image";

interface CollectionBannerDisplayProps {
  bannerUrl: string | null | undefined;
  categoryName: string; // For alt text
}

export default function CollectionBannerDisplay({
  bannerUrl,
  categoryName,
}: CollectionBannerDisplayProps) {
  if (!bannerUrl) {
    // Don't render anything if there's no banner URL
    return null;
  }

  return (
    <div className="w-full mb-6 md:mb-8">
      {" "}
      {/* Add some margin below the banner */}
      {/* Set an aspect ratio for responsiveness. Adjust as needed. */}
      {/* Example: 4:1 aspect ratio (adjust numbers for different ratios like 3:1, 16:5 etc.) */}
      <div className="relative w-full aspect-[4/1] overflow-hidden rounded-md shadow-sm">
        <Image
          src={bannerUrl}
          alt={`${categoryName} Collection Banner`}
          fill
          priority // Load banner image sooner as it's likely high on the page
          className="object-cover" // Cover ensures the image fills the container
          sizes="100vw" // Banner likely spans viewport width
        />
      </div>
    </div>
  );
}

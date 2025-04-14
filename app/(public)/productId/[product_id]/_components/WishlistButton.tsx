"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/app/(public)/(group-products)/_components/_store/wishlist-store";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/SessionProvider";

interface WishlistButtonProps {
  variationId: string;
  productName: string;
  className?: string;
  size?: number;
  fillColor?: string;
}

export default function WishlistButton({
  variationId,
  productName,
  className = "",
  size = 24,
  fillColor = "#ff0000", // Red color for the filled heart
}: WishlistButtonProps) {
  const router = useRouter();
  const { user } = useSession();
  const [mounted, setMounted] = useState(false);

  // Get state and actions from wishlist store
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const toggleWishlistItem = useWishlistStore(
    (state) => state.toggleWishlistItem,
  );
  const isProcessing = useWishlistStore((state) => state.isProcessing);

  // Local state to track wishlist status
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Set mounted state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Check if this variation is already in the wishlist
    if (user && variationId) {
      setIsWishlisted(isInWishlist(variationId));
    }
  }, [user, variationId, isInWishlist]);

  // If no user session or component isn't mounted yet, don't render anything
  if (!user || !mounted) {
    return null;
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing) return;

    try {
      await toggleWishlistItem(variationId);
      setIsWishlisted(!isWishlisted);

      toast.success(
        isWishlisted ? `Removed from wishlist` : `Added to wishlist`,
        {
          description: productName,
          duration: 3000,
        },
      );
    } catch (error) {
      toast.error("Failed to update wishlist");
      console.error("Wishlist error:", error);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isProcessing}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-2 rounded-full transition-all duration-200 ${className} 
                   ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Heart
        size={size}
        fill={isWishlisted ? fillColor : "none"}
        color={isWishlisted ? fillColor : "currentColor"}
        strokeWidth={2}
        className={`transition-all duration-300 ${isWishlisted ? "scale-110" : "scale-100"}`}
      />
    </button>
  );
}

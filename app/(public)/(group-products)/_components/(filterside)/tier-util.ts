// app/(public)/(group-products)/_components/(filterside)/tier-util.ts
"use client";

import { useSession } from "@/app/SessionProvider";
import { Tier } from "@prisma/client"; // Import the Tier enum

// Define discount percentages for each tier
export const TIER_DISCOUNTS: Record<Tier, number> = {
  // Use Record<Tier, number> for type safety
  BRONZE: 0,
  SILVER: 0.05,
  GOLD: 0.1,
  PLATINUM: 0.15,
};

// Get discount percentage based on user tier
export function getDiscountPercentage(tier: Tier | undefined): number {
  // Use Tier type
  if (!tier) return 0;
  // Use || 0 as fallback in case tier from DB is somehow invalid (though SessionProvider should handle default)
  return TIER_DISCOUNTS[tier] ?? 0;
}

// Calculate discounted price
export function calculateDiscountedPrice(
  originalPrice: number,
  tier: Tier | undefined, // Use Tier type
): number {
  const discountPercentage = getDiscountPercentage(tier);
  // Ensure price is a number
  if (typeof originalPrice !== "number" || isNaN(originalPrice)) {
    console.warn(
      `Invalid price passed to calculateDiscountedPrice: ${originalPrice}`,
    );
    return originalPrice; // Return original price if invalid
  }
  return originalPrice * (1 - discountPercentage);
}

// Format currency (existing function)
export function formatCurrency(amount: number): string {
  // ... implementation ...
  return new Intl.NumberFormat("en-ZA", {
    /* ... options ... */
  })
    .format(amount)
    .replace("ZAR", "R")
    .replace(".", ","); // Consider locale-aware formatting if needed elsewhere
}

// Custom hook to get tier discount information
export function useTierDiscount() {
  const { user } = useSession(); // user object now has the 'tier' property correctly typed

  // Default to BRONZE if user is null or tier is somehow missing (shouldn't happen if provider is set up right)
  const userTier: Tier = user?.tier || Tier.BRONZE;

  const discountPercentage = getDiscountPercentage(userTier);
  const hasDiscount = discountPercentage > 0;

  return {
    userTier,
    discountPercentage,
    hasDiscount,
    // Pass the determined userTier to the calculation function
    calculatePrice: (price: number) =>
      calculateDiscountedPrice(price, userTier),
  };
}

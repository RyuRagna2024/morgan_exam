"use client";

import { useSession } from "@/app/SessionProvider";

// Define discount percentages for each tier
export const TIER_DISCOUNTS = {
  BRONZE: 0, // No discount for Bronze (standard price)
  SILVER: 0.05, // 5% discount for Silver
  GOLD: 0.1, // 10% discount for Gold
  PLATINUM: 0.15, // 15% discount for Platinum
};

// Get discount percentage based on user tier
export function getDiscountPercentage(tier: string | undefined): number {
  if (!tier) return 0;
  return TIER_DISCOUNTS[tier as keyof typeof TIER_DISCOUNTS] || 0;
}

// Calculate discounted price
export function calculateDiscountedPrice(
  originalPrice: number,
  tier: string | undefined,
): number {
  const discountPercentage = getDiscountPercentage(tier);
  return originalPrice * (1 - discountPercentage);
}

// Format currency (copy of your existing function)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    numberingSystem: "latn",
    useGrouping: true,
  })
    .format(amount)
    .replace("ZAR", "R")
    .replace(".", ",");
}

// Custom hook to get tier discount information
export function useTierDiscount() {
  const { user } = useSession();
  const userTier = user?.tier || "BRONZE";

  const discountPercentage = getDiscountPercentage(userTier);
  const hasDiscount = discountPercentage > 0;

  return {
    userTier,
    discountPercentage,
    hasDiscount,
    calculatePrice: (price: number) =>
      calculateDiscountedPrice(price, userTier),
  };
}

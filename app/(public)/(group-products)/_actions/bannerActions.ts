// app/(public)/(group-products)/_actions/bannerActions.ts

"use server";

import prisma from "@/lib/prisma";

interface GetBannerResult {
  success: boolean;
  bannerUrl?: string | null;
  error?: string;
}

/**
 * Fetches the banner URL for a specific category.
 * @param category - The category identifier (e.g., 'headwear', 'apparel').
 */
export async function getCollectionBanner(
  category: string,
): Promise<GetBannerResult> {
  // Normalize category input to lowercase for consistent lookup
  const normalizedCategory = category.toLowerCase();

  try {
    const banner = await prisma.collectionBanner.findUnique({
      where: { category: normalizedCategory },
      select: { imageUrl: true },
    });

    return {
      success: true,
      bannerUrl: banner?.imageUrl ?? null, // Return URL or null if not found
    };
  } catch (error) {
    console.error(
      `Error fetching banner for category ${normalizedCategory}:`,
      error,
    );
    return {
      success: false,
      error: "Failed to fetch collection banner.",
      bannerUrl: null,
    };
  }
}

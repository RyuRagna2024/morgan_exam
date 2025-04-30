// app/api/featured-products/route.ts

import { NextResponse, type NextRequest } from "next/server"; // Use NextRequest for type safety
import { getFeaturedProducts } from "@/app/(public)/(group-products)/_components/(filterside)/product-fetch"; // Adjust path to your actual function

// --- GET Handler ---
// Handles GET requests to /api/featured-products
export async function GET(request: NextRequest) {
  // Extract search parameters from the URL
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const exclude = searchParams.get("exclude") || undefined; // Get exclude ID, default to undefined if not present

  // Parse limit, default to 5 if invalid or missing
  const limit = limitParam ? parseInt(limitParam, 10) : 5;
  if (isNaN(limit) || limit <= 0) {
    console.warn(
      `[API /featured-products] Invalid limit parameter received: ${limitParam}. Defaulting to 5.`,
    );
    // Optionally return error or just default:
    // return NextResponse.json({ success: false, error: 'Invalid limit parameter' }, { status: 400 });
  }

  console.log(
    `[API /featured-products] Received request: limit=${limit}, exclude=${exclude}`,
  );

  try {
    // Call your actual server action/function to fetch the data
    const result = await getFeaturedProducts({
      limit: Math.max(1, limit), // Ensure limit is at least 1
      excludeProductId: exclude,
    });

    // Return the result from the server action
    if (result.success) {
      console.log(
        `[API /featured-products] Success - Returning ${result.products?.length ?? 0} products.`,
      );
      return NextResponse.json(result); // Returns { success: true, products: [...] }
    } else {
      console.error(`[API /featured-products] Fetch failed: ${result.error}`);
      // Return the error from the server action
      return NextResponse.json(result, { status: 500 }); // Status 500 for server-side fetch failure
    }
  } catch (error) {
    console.error("[API /featured-products] Unexpected Error:", error);
    // Generic error for unexpected issues
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error fetching featured products",
      },
      { status: 500 },
    );
  }
}

// You can add POST, PUT, DELETE handlers here later if needed

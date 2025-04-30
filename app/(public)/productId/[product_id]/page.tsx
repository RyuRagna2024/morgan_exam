// app/(public)/productId/[product_id]/page.tsx

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetails from "./_components/ProductDetails";
import { addToCart } from "../cart/_cart-actions/add-to-cart"; // Adjust path if needed
import { getProductById } from "../../(group-products)/_components/(filterside)/product-fetch"; // Fetch main product directly
import ProductGrid from "../../(group-products)/(unviresal_comp)/UnifiedProductGrid"; // Assuming this component exists
import { Button } from "@/components/ui/button";
// --- REMOVED ArrowLeft - now inside ProductDetails ---
// import { ArrowLeft } from "lucide-react";
// --- REMOVED Tooltip imports - now inside ProductDetails ---
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProductWithVariations } from "../../(group-products)/_components/(filterside)/types"; // Adjust path if needed

interface ProductDetailsPageProps {
  params: {
    product_id?: string;
    productId?: string;
  };
}

// Optional: Force dynamic rendering
// export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const productId = params.product_id || params.productId;

  if (!productId) {
    console.error("Product ID missing in page parameters.");
    notFound();
  }

  // --- Fetch Data Server-Side ---
  let featuredProducts: ProductWithVariations[] = [];
  let featuredFetchError = null;
  let mainProductFetchError = null;
  let backUrl = "/all-collections"; // Default
  let productCategoryName = "Products"; // Default
  let mainProductName = "Product"; // Default name
  let mainProductResultSuccess = false; // Explicit success flag

  // --- Fetch main product first ---
  const mainProductResult = await getProductById(productId);
  if (mainProductResult.success && mainProductResult.product) {
    mainProductResultSuccess = true; // Set flag on success
    mainProductName = mainProductResult.product.productName;
    // Determine back URL based on category
    if (mainProductResult.product.category?.length > 0) {
      const primaryCategory =
        mainProductResult.product.category[0].toLowerCase();
      if (["headwear", "apparel"].includes(primaryCategory)) {
        backUrl = `/${primaryCategory}`;
        productCategoryName =
          primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);
      } else {
        // Default other categories to All Collections
        backUrl = "/all-collections";
        productCategoryName = "All Collections";
      }
    }
  } else {
    mainProductFetchError =
      mainProductResult.error || "Could not load product details.";
    console.error("Main product fetch failed:", mainProductFetchError);
  }

  // --- Fetch FEATURED products via API Route ---
  if (productId) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.VERCEL_URL ||
        "http://localhost:3000";
      const absoluteUrl = baseUrl.startsWith("http")
        ? baseUrl
        : `https://${baseUrl}`;
      const apiUrl = new URL(`/api/featured-products`, absoluteUrl);
      apiUrl.searchParams.set("limit", "5");
      apiUrl.searchParams.set("exclude", productId);

      console.log(`Fetching featured products from: ${apiUrl.toString()}`);
      const res = await fetch(apiUrl.toString(), { cache: "no-store" });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`API Error ${res.status}: ${errorText}`);
        throw new Error(`API responded with status ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.products) {
        featuredProducts = data.products as ProductWithVariations[];
      } else {
        console.error("API Error Response:", data);
        throw new Error(
          data.error || "API returned unsuccessful result or no products",
        );
      }
    } catch (error) {
      console.error("Failed to fetch featured products via API:", error);
      featuredFetchError =
        error instanceof Error
          ? error.message
          : "Could not load featured products.";
    }
  }
  // --- End Data Fetching ---

  // --- Handle Main Product Fetch Failure ---
  if (!mainProductResultSuccess) {
    return (
      <div
        className={cn(
          "container mx-auto px-4 py-8 sm:py-10 mt-6",
          "bg-background text-foreground",
        )}
      >
        <div className="text-center text-destructive p-4 border border-destructive/50 bg-destructive/10 rounded-md mt-20">
          {mainProductFetchError || "Product could not be loaded."}
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div
      className={cn(
        "container mx-auto px-4 py-8 sm:py-10 mt-6",
        "bg-background text-foreground",
      )}
    >
      {/* --- Page Header (Title Only) --- */}
      <div className="mb-6 md:mb-8">
        {" "}
        {/* Removed relative as button is inside details now */}
        <h1 className="text-3xl md:text-4xl font-bold text-center tracking-tight pt-12 md:pt-0">
          {" "}
          {/* Padding might be adjustable now */}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground dark:from-gray-200 dark:to-gray-500">
            {mainProductName} Details
          </span>
        </h1>
        {/* --- BACK BUTTON REMOVED FROM HERE --- */}
      </div>
      {/* --- END Page Header --- */}

      {/* Product Details Component Wrapper */}
      <div className="mt-6 mb-8 md:mb-10">
        {/* Pass necessary props for the internal back button */}
        <ProductDetails
          addToCartAction={addToCart}
          backUrl={backUrl}
          productCategoryName={productCategoryName}
        />
      </div>

      {/* Featured Products Section */}
      <div className="border-t border-border pt-8 md:pt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-foreground">
          Featured Products
        </h2>
        {featuredFetchError && (
          <p className="text-center text-destructive mb-8">
            {" "}
            Could not load featured products: {featuredFetchError}{" "}
          </p>
        )}
        {!featuredFetchError && featuredProducts.length > 0 ? (
          <>
            <ProductGrid products={featuredProducts} enableLogging={false} />
            <div className="text-center mt-10">
              {" "}
              <Link href="/all-collections">
                {" "}
                <Button variant="outline" size="lg">
                  {" "}
                  See More{" "}
                </Button>{" "}
              </Link>{" "}
            </div>
          </>
        ) : (
          !featuredFetchError && (
            <p className="text-center text-muted-foreground">
              {" "}
              No featured products found.{" "}
            </p>
          )
        )}
      </div>
    </div>
  );
}

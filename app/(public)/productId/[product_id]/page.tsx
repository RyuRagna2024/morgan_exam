// app/(public)/productId/[product_id]/page.tsx
import React from "react";
import Link from "next/link";
import ProductDetails from "./_components/ProductDetails";
import { addToCart } from "../cart/_cart-actions/add-to-cart";
import {
  getProductById,
  getRelatedProducts,
} from "../../(group-products)/_components/(filterside)/product-fetch";
import ProductGrid from "../../(group-products)/(unviresal_comp)/UnifiedProductGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProductWithVariations } from "../../(group-products)/_components/(filterside)/types";

// Interface for server component props including params
interface ProductDetailsPageProps {
  params: {
    // Ensure this matches your actual folder name: '[product_id]' or '[productId]'
    product_id?: string;
    productId?: string;
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  // --- Get Product ID ---
  const productId = params.product_id || params.productId;

  // --- Fetch Data Server-Side ---
  let relatedProducts: ProductWithVariations[] = [];
  let relatedFetchError = null;
  let mainProductFetchError = null;
  let backUrl = "/all-collections"; // Default back URL
  let productCategoryName = "Products"; // Default category name

  if (productId) {
    // Fetch main product for category info
    const mainProductResult = await getProductById(productId);
    if (mainProductResult.success && mainProductResult.product) {
      if (
        mainProductResult.product.category &&
        mainProductResult.product.category.length > 0
      ) {
        const primaryCategory =
          mainProductResult.product.category[0].toLowerCase();
        if (["headwear", "apparel"].includes(primaryCategory)) {
          backUrl = `/${primaryCategory}`;
          productCategoryName =
            primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);
        } else if (primaryCategory === "all-collections") {
          backUrl = "/all-collections";
          productCategoryName = "All Collections";
        }
        // Other categories default to /all-collections
      }
    } else {
      console.error("Failed to fetch main product:", mainProductResult.error);
      mainProductFetchError =
        mainProductResult.error || "Could not load product details.";
    }

    // Fetch related products
    const relatedResult = await getRelatedProducts(productId, 4); // Fetch 4 related products
    if (relatedResult.success && relatedResult.products) {
      relatedProducts = relatedResult.products as ProductWithVariations[];
    } else {
      console.error("Failed to fetch related products:", relatedResult.error);
      relatedFetchError =
        relatedResult.error || "Could not load related products.";
    }
  } else {
    console.error("Product ID not found in page parameters.");
    mainProductFetchError = "Product ID is missing.";
  }
  // --- End Data Fetching ---

  return (
    <div
      className={cn(
        "container mx-auto px-4 py-8 sm:py-10 mt-6",
        "bg-background text-foreground",
      )}
    >
      {/* Back Button & Page Header */}
      <div className="relative mb-6 md:mb-8">
        <div className="absolute top-0 right-0 z-10">
          {" "}
          {/* Added z-index */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              {/* --- Inverted Nesting: Link wraps TooltipTrigger --- */}
              <Link href={backUrl} passHref legacyBehavior>
                <TooltipTrigger asChild>
                  {/* Use an actual button or anchor for accessibility */}
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Back to ${productCategoryName}`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Link>
              {/* --- End Inverted Nesting --- */}
              <TooltipContent>
                {" "}
                <p>Back to {productCategoryName}</p>{" "}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center tracking-tight pt-12 md:pt-0">
          {" "}
          {/* Adjusted padding */}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground dark:from-gray-200 dark:to-gray-500">
            Product Details
          </span>
        </h1>
      </div>

      {/* Product Details Component Wrapper */}
      <div className="mt-6 mb-8 md:mb-10">
        {mainProductFetchError ? (
          <div className="text-center text-destructive p-4 border border-destructive/50 bg-destructive/10 rounded-md">
            {mainProductFetchError}
          </div>
        ) : productId ? (
          <ProductDetails addToCartAction={addToCart} />
        ) : (
          // Handle case where ID was missing entirely from params
          <div className="text-center text-destructive p-4 border border-destructive/50 bg-destructive/10 rounded-md">
            Product not found. Invalid URL.
          </div>
        )}
      </div>

      {/* Featured Products Section */}
      <div className="border-t border-border pt-8 md:pt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-foreground">
          Featured Products
        </h2>
        {/* Show related products error if it occurred */}
        {relatedFetchError &&
          !mainProductFetchError && ( // Only show if main product loaded ok
            <p className="text-center text-destructive mb-8">
              {relatedFetchError}
            </p>
          )}
        {relatedProducts.length > 0 ? (
          <>
            <ProductGrid products={relatedProducts} enableLogging={false} />
            <div className="text-center mt-10">
              <Link href="/all-collections">
                {" "}
                <Button variant="outline" size="lg">
                  See More
                </Button>{" "}
              </Link>
            </div>
          </>
        ) : (
          // Show only if no fetch errors occurred for related products
          !relatedFetchError &&
          !mainProductFetchError &&
          productId && (
            <p className="text-center text-muted-foreground">
              No related products found.
            </p>
          )
        )}
      </div>
    </div>
  );
}

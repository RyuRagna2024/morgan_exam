// app/(public)/productId/[product_id]/page.tsx
import React from "react";
import Link from "next/link";
import ProductDetails from "./_components/ProductDetails";
import { addToCart } from "../cart/_cart-actions/add-to-cart";
import { getRelatedProducts } from "../../(group-products)/_components/(filterside)/product-fetch";
import ProductGrid from "../../(group-products)/(unviresal_comp)/UnifiedProductGrid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductWithVariations } from "../../(group-products)/_components/(filterside)/types";

interface ProductDetailsPageProps {
  params: {
    product_id?: string;
    productId?: string;
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const productId = params.product_id || params.productId;

  let relatedProducts: ProductWithVariations[] = [];
  let fetchError = null;

  if (productId) {
    const relatedResult = await getRelatedProducts(productId, 4);
    if (relatedResult.success && relatedResult.products) {
      relatedProducts = relatedResult.products as ProductWithVariations[];
    } else {
      console.error("Failed to fetch related products:", relatedResult.error);
      fetchError = relatedResult.error || "Could not load related products.";
    }
  } else {
    console.error("Product ID not found in page parameters.");
    fetchError = "Product ID is missing.";
  }

  return (
    // --- REDUCED Top Margin ---
    <div
      className={cn(
        "container mx-auto px-4 py-8 sm:py-10 mt-6", // Reduced py and mt
        "bg-background text-foreground",
      )}
    >
      {/* Page Header - REDUCED bottom margin */}
      <div className="mb-8 md:mb-10">
        {" "}
        {/* Reduced mb-12 */}
        <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground dark:from-gray-200 dark:to-gray-500">
            Product Details
          </span>
        </h1>
        {/* --- REMOVED Subtitle Paragraph --- */}
        {/* <p className="text-center text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
                    Explore all specifications and options for this premium item
                </p> */}
      </div>

      {/* Product Details Component Wrapper - Keep reduced bottom margin */}
      <div className="mt-6 mb-8 md:mb-10">
        <ProductDetails addToCartAction={addToCart} />
      </div>

      {/* Featured Products Section */}
      <div className="border-t border-border pt-12">
        {" "}
        {/* Keep pt-12 */}
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          Featured Products
        </h2>
        {fetchError && (
          <p className="text-center text-destructive mb-8">{fetchError}</p>
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
          !fetchError && (
            <p className="text-center text-muted-foreground">
              No related products found.
            </p>
          )
        )}
      </div>
    </div>
  );
}

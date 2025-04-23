// app/(public)/(group-products)/headwear/page.tsx
"use client";

import { useProductsByPathname } from "../_components/_store/useProductsByPathname";
import ProductGrid from "../(unviresal_comp)/UnifiedProductGrid";
// Removed unused imports: useEffect, useState, getCollectionBanner, EditableCollectionBanner, Skeleton

export default function HeadwearPage() {
  // Products are fetched based on the pathname by the hook
  // The banner is handled by the layout component wrapping this page
  const {
    products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProductsByPathname();

  const categoryName = "Headwear"; // For page title

  // Ensure products is always an array for mapping
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div>
      {/* Banner is rendered by the layout */}

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">{categoryName} Collection</h1>

      {/* Product Grid Section */}
      {isLoadingProducts ? (
        <div className="text-center py-12 text-gray-500">
          Loading products...
        </div>
      ) : productsError ? (
        <div className="text-center py-12 text-red-500">
          Error loading products: {productsError}
        </div>
      ) : safeProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {categoryName.toLowerCase()} products found matching the current
          filters.
        </div>
      ) : (
        <ProductGrid products={safeProducts} enableLogging={false} />
      )}
    </div>
  );
}

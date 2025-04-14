"use client";

import { useProductsByPathname } from "../_components/_store/useProductsByPathname";
import ProductGrid from "../(unviresal_comp)/UnifiedProductGrid";
import { useEffect } from "react";

export default function ApparelPage() {
  // Use the custom hook to get products filtered by pathname
  const { products, isLoading, error } = useProductsByPathname();

  // Debug logging
  useEffect(() => {
    console.log("ApparelPage rendered:", {
      productsCount: products?.length || 0,
      isLoading,
      error,
    });
  }, [products, isLoading, error]);

  // Handle loading state
  if (isLoading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  // Handle error state
  if (error) {
    console.error("Error loading apparel products:", error);
    return (
      <div className="text-center py-12 text-red-500">
        Error loading products: {error}
      </div>
    );
  }

  // Safe check for products array
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Apparel Collection</h1>
      {safeProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No apparel products found.
        </div>
      ) : (
        <ProductGrid products={safeProducts} enableLogging={true} />
      )}
    </div>
  );
}

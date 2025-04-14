"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductCard } from "./Card";
import { ProductWithVariations } from "../_components/(filterside)/types";

interface ProductGridProps {
  products: ProductWithVariations[];
  enableLogging?: boolean;
}

export default function ProductGrid({
  products,
  enableLogging = false,
}: ProductGridProps) {
  const pathname = usePathname();
  const loggedRef = useRef(false);

  // Debugging logs if enabled - only log once to prevent excessive re-renders
  useEffect(() => {
    if (!enableLogging || loggedRef.current) return;

    console.log(`ProductGrid (${pathname}): Received products:`, products);

    // Log detailed info about each product's image
    products.forEach((product, index) => {
      console.log(`Product ${index + 1} (${product.productName}):`, {
        id: product.id,
        imageUrl: product.productImgUrl,
        hasVariations: product.variations
          ? product.variations.length > 0
          : false,
      });

      // Check if variations have images
      if (product.variations && product.variations.length > 0) {
        console.log(
          `Variation images for ${product.productName}:`,
          product.variations.map((v) => ({
            name: v.name,
            imageUrl: v.imageUrl,
          })),
        );
      }
    });

    loggedRef.current = true;
  }, [products, pathname, enableLogging]);

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <Link href={`/productId/${product.id}`} key={product.id}>
          {/* Pass the entire product object, including variations */}
          <ProductCard {...product} />
        </Link>
      ))}
    </div>
  );
}

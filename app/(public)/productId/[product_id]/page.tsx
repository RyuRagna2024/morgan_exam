// src/app/(public)/productId/[product_id]/page.tsx
import React from "react";
import ProductDetails from "./_components/ProductDetails"; // Corrected import path
// --- Actions needed by ProductDetails ---
import { addToCart } from "../cart/_cart-actions/add-to-cart";
// --- Actions NOT needed by ProductDetails - Remove imports ---
// import { updateCartItem } from "../cart/_cart-actions/update-cart";
// import { clearCart } from "../cart/_cart-actions/clear-cart";
import { cn } from "@/lib/utils"; // Import cn if needed for styling page container

export default function ProductDetailsPage() {
  return (
    // Added theme classes for background consistency
    <div
      className={cn(
        "container mx-auto px-4 py-12 mt-10",
        "bg-background text-foreground", // Apply base theme background/text
      )}
    >
      {/* Page Header - Modern Design */}
      <div className="mb-12">
        {/* Added dark mode text gradient */}
        <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground dark:from-gray-200 dark:to-gray-500">
            Product Details
          </span>
        </h1>
        {/* Use muted-foreground for subtitle */}
        <p className="text-center text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
          Explore all specifications and options for this premium item
        </p>
      </div>

      {/* Product Details Component */}
      <div className="mt-6">
        {/* Pass only the required action */}
        <ProductDetails
          addToCartAction={addToCart}
          // updateCartItemAction={updateCartItem} // <<< REMOVED
          // clearCartAction={clearCart}          // <<< REMOVED
        />
      </div>
    </div>
  );
}

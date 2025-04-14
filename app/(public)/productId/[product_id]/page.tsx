// This is the server component that imports server actions
// src/app/products/[productId]/page.tsx
import React from "react";
import ProductDetails from "./_components/ProductDetails";
import { addToCart } from "../cart/_cart-actions/add-to-cart";
import { updateCartItem } from "../cart/_cart-actions/update-cart";
import { clearCart } from "../cart/_cart-actions/clear-cart";

export default function ProductDetailsPage() {
  return (
    <div className="container mx-auto px-4 py-12 mt-10">
      {/* Page Header - Modern Design */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Product Details
          </span>
        </h1>
        <p className="text-center text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          Explore all specifications and options for this premium item
        </p>
      </div>

      {/* Product Details Component */}
      <div className="mt-6">
        <ProductDetails
          addToCartAction={addToCart}
          updateCartItemAction={updateCartItem}
          clearCartAction={clearCart}
        />
      </div>
    </div>
  );
}

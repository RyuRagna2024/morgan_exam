import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getUserWishlist } from "@/app/(public)/(group-products)/_components/(filterside)/wish-list";
import WishlistItemCard from "./WishlistItemCard";

export default async function WishlistPage() {
  // Fetch wishlist items using the server action
  const { success, wishlistItems, error } = await getUserWishlist();

  // Handle error state
  if (!success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "An error occurred while loading your wishlist."}
        </div>
      </div>
    );
  }

  // Handle empty wishlist
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
        <div className="text-center py-12">
          <h2 className="text-xl mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Add items to your wishlist to save them for later.
          </p>
          <Link
            href="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

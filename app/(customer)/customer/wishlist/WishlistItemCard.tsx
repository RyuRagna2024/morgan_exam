"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { removeFromWishlist } from "@/app/(public)/(group-products)/_components/(filterside)/wish-list";
import { formatCurrency } from "./formatCurrency";
import { useTierDiscount } from "@/app/(public)/(group-products)/_components/(filterside)/tier-util";

interface WishlistItemProps {
  item: {
    id: string;
    variationId: string;
    variation: {
      id: string;
      name: string;
      color: string;
      size: string;
      sku: string;
      quantity: number;
      price: number;
      imageUrl: string;
      product: {
        id: string;
        productName: string;
        productImgUrl: string;
        sellingPrice: number;
      };
    };
  };
}

export default function WishlistItemCard({ item }: WishlistItemProps) {
  const [isPending, startTransition] = useTransition();
  // Get tier discount information
  const { hasDiscount, calculatePrice, userTier, discountPercentage } =
    useTierDiscount();

  // Format tier name for display
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  // Get item price and calculate discounted price
  const originalPrice =
    item.variation.price || item.variation.product.sellingPrice;
  const discountedPrice = calculatePrice(originalPrice);

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromWishlist(item.variation.id);
      // Optionally refresh the page or update UI state
      window.location.reload();
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-64 w-full">
        {/* Add discount badge if user has a tier discount */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            {Math.round(discountPercentage * 100)}% {tierName} Discount
          </div>
        )}

        <Image
          src={item.variation.imageUrl || item.variation.product.productImgUrl}
          alt={item.variation.product.productName}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">
          {item.variation.product.productName}
        </h3>

        <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
          {item.variation.name && <p>Variation: {item.variation.name}</p>}
          {item.variation.color && <p>Color: {item.variation.color}</p>}
          {item.variation.size && <p>Size: {item.variation.size}</p>}
          {hasDiscount && (
            <p className="text-red-600 font-medium">
              {tierName} tier price applies
            </p>
          )}
        </div>

        <div className="flex justify-between items-center">
          {hasDiscount ? (
            <div>
              <span className="font-bold text-lg text-red-600">
                {formatCurrency(discountedPrice)}
              </span>
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatCurrency(originalPrice)}
              </span>
            </div>
          ) : (
            <span className="font-bold text-lg">
              {formatCurrency(originalPrice)}
            </span>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              {isPending ? "Removing..." : "Remove"}
            </button>

            <Link
              href={`/productId/${item.variation.product.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
            >
              View Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

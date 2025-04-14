"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTierDiscount } from "../(group-products)/_components/(filterside)/tier-util";

// Types
interface CartItem {
  id: string;
  quantity: number;
  variation: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    product: {
      id: string;
      productName: string;
    };
  };
}

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
}

export default function OrderSummary({ items, totalPrice }: OrderSummaryProps) {
  // Get tier discount information
  const { hasDiscount, discountPercentage, userTier, calculatePrice } =
    useTierDiscount();

  // Calculate discounted total
  const discountedTotalPrice = totalPrice * (1 - discountPercentage);

  // Format tier name for display
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button variant="outline">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Membership Tier Badge */}
            {hasDiscount && (
              <div className="mb-4 py-2 px-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-red-600 text-sm font-medium">
                  {tierName} Tier Discount:{" "}
                  {Math.round(discountPercentage * 100)}% OFF
                </p>
              </div>
            )}

            <div className="divide-y">
              {items.map((item) => {
                // Calculate discounted item price
                const originalItemPrice = item.variation.price;
                const discountedItemPrice = calculatePrice(originalItemPrice);
                const itemSubtotal = discountedItemPrice * item.quantity;

                return (
                  <div key={item.id} className="py-4 flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded relative">
                      <Image
                        src={item.variation.imageUrl}
                        alt={item.variation.product.productName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium">
                        {item.variation.product.productName}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.variation.name}
                      </p>

                      <div className="flex items-center mt-1 justify-between">
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded h-7 text-sm"
                            value={item.quantity}
                            disabled
                            aria-label={`Quantity for ${item.variation.product.productName}`}
                            title="Quantity"
                          >
                            <option>{item.quantity}</option>
                          </select>
                          <button
                            className="text-red-500 text-sm"
                            type="button"
                            disabled
                          >
                            Remove
                          </button>
                        </div>

                        {/* Price display with discount if applicable */}
                        {hasDiscount ? (
                          <div className="text-right">
                            <span className="font-medium text-red-600">
                              R{discountedItemPrice.toFixed(2)}
                            </span>
                            <span className="text-gray-500 text-xs line-through ml-1">
                              R{originalItemPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            R{originalItemPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Subtotal: R{itemSubtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t mt-4 pt-4">
              {hasDiscount ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span className="line-through">
                      R{totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>
                      {tierName} Discount (
                      {Math.round(discountPercentage * 100)}%):
                    </span>
                    <span>
                      -R{(totalPrice - discountedTotalPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R{discountedTotalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between font-bold">
                  <span>Total:</span>
                  <span>R{totalPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

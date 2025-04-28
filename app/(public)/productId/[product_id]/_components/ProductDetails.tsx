// app/(public)/productId/[product_id]/_components/ProductDetails.tsx
"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react"; // Added React import for event type
import { toast } from "sonner";
import { useProductDetails } from "../useProductDetails";
import { useProductStore } from "../../../(group-products)/_components/_store/product-store";
import ProductImage from "./ProductImage";
import VariationSelector from "./VariationSelector";
import ProductStatus from "./ProductStatus";
import WishlistButton from "./WishlistButton";
import { useTierDiscount } from "@/app/(public)/(group-products)/_components/(filterside)/tier-util";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"; // <<< ADD Input import

// Define Variation type locally or import if defined elsewhere
interface Variation {
  id: string;
  name: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl: string;
}
interface AddToCartResult {
  success: boolean;
  message: string;
  cartItemCount?: number;
}
interface ProductDetailsProps {
  initialProductId?: string;
  addToCartAction: (formData: {
    variationId: string;
    quantity: number;
  }) => Promise<AddToCartResult>;
}

export default function ProductDetails({
  initialProductId,
  addToCartAction,
}: ProductDetailsProps) {
  // ... (useState, useMemo, useEffect hooks remain the same) ...
  const params = useParams();
  const [isStoreReady, setIsStoreReady] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariationImage, setSelectedVariationImage] = useState<
    string | null
  >(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  const { hasDiscount, calculatePrice, userTier, discountPercentage } =
    useTierDiscount();
  const allProducts = useProductStore((state) => state.allProducts);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const productId = useMemo<string | null>(() => {
    /* ... */ if (initialProductId) return initialProductId;
    if (!params) return null;
    let id: string | null = null;
    if (typeof params.productId === "string") {
      id = params.productId;
    } else if (Array.isArray(params.productId) && params.productId.length > 0) {
      id = params.productId[0] as string;
    } else if (typeof params.product_id === "string") {
      id = params.product_id;
    } else if (
      Array.isArray(params.product_id) &&
      params.product_id.length > 0
    ) {
      id = params.product_id[0] as string;
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      Object.entries(params).forEach(([key, value]) => {
        if (!id && typeof value === "string" && uuidRegex.test(value)) {
          id = value;
        }
      });
    }
    return id;
  }, [params, initialProductId]);
  useEffect(() => {
    if (allProducts.length === 0) {
      fetchProducts().then(() => setIsStoreReady(true));
    } else {
      setIsStoreReady(true);
    }
  }, [allProducts.length, fetchProducts]);
  const { product, isLoading, error } = useProductDetails({
    productId: isStoreReady ? productId : null,
    autoLoad: true,
  });
  const currentVariation = useMemo<Variation | null>(() => {
    if (!product?.variations || !selectedColor || !selectedSize) return null;
    return (
      product.variations.find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      ) || null
    );
  }, [product, selectedColor, selectedSize]);
  const discountedVariationPrice = useMemo(() => {
    if (!currentVariation) return null;
    return calculatePrice(currentVariation.price);
  }, [currentVariation, calculatePrice]);
  const discountedBasePrice = useMemo(() => {
    if (!product) return null;
    return calculatePrice(product.sellingPrice);
  }, [product, calculatePrice]);
  useEffect(() => {
    if (product?.variations?.length) {
      const first = product.variations[0];
      if (
        !selectedColor ||
        !selectedSize ||
        (currentVariation &&
          currentVariation.id.split("-")[0] !== product.id.split("-")[0])
      ) {
        setSelectedColor(first.color);
        setSelectedSize(first.size);
        setSelectedVariationImage(first.imageUrl);
        setQuantity(1);
      }
    }
  }, [product, selectedColor, selectedSize, currentVariation]);
  useEffect(() => {
    if (currentVariation) {
      setSelectedVariationImage(currentVariation.imageUrl);
    }
    if (!currentVariation && selectedColor && selectedSize) {
      setQuantity(1);
    }
  }, [currentVariation, selectedColor, selectedSize]);
  const handleColorSelect = (color: string): void => {
    setSelectedColor(color);
    if (!product?.variations) return;
    const variationsForColor = product.variations.filter(
      (v) => v.color === color,
    );
    const sizesForColor = variationsForColor.map((v) => v.size);
    const firstAvailableSize = sizesForColor[0];
    const newSize = sizesForColor.includes(selectedSize as string)
      ? selectedSize
      : firstAvailableSize;
    setSelectedSize(newSize);
    const variation = variationsForColor.find((v) => v.size === newSize);
    if (variation) {
      setSelectedVariationImage(variation.imageUrl);
    }
    setQuantity(1);
  };
  const handleSizeSelect = (size: string): void => {
    setSelectedSize(size);
    const variation = product?.variations?.find(
      (v) => v.color === selectedColor && v.size === size,
    );
    if (variation) {
      setSelectedVariationImage(variation.imageUrl);
    }
    setQuantity(1);
  };
  const handleAddToCart = async () => {
    if (!currentVariation) {
      toast.error("Please select variation options.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    if (quantity > currentVariation.quantity) {
      toast.error("Quantity exceeds available stock.");
      return;
    }
    setIsAddingToCart(true);
    try {
      const result = await addToCartAction({
        variationId: currentVariation.id,
        quantity: quantity,
      });
      if (result.success) {
        toast.success(`Added ${quantity} item(s) to cart`, {
          description: product?.productName,
          duration: 3000,
        });
        if (typeof window !== "undefined") {
          import("../../../productId/cart/_store/cart-store")
            .then((module) => module.useCartStore.getState().refreshCart(true))
            .catch((e) => console.error("Error importing cart store:", e));
        }
      } else {
        toast.error(result.message || "Failed to add item.");
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Add to cart error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  // --- Loading/Error/Not Found Status ---
  if (!isStoreReady || isLoading || (!isLoading && !product && productId)) {
    return (
      <ProductStatus
        isLoading={!isStoreReady || isLoading}
        error={error}
        productId={productId}
        isProductFound={!!product && !isLoading}
      />
    );
  }
  if (!product) {
    return (
      <ProductStatus
        isLoading={false}
        error={null}
        productId={productId}
        isProductFound={false}
      />
    );
  }
  // --- End Status ---
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();
  // --- No Variations Case ---
  if (!product.variations || product.variations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border overflow-hidden relative p-6">
          <p>This product is currently unavailable or has no options.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border overflow-hidden relative">
        {/* ... Tier Badge and Wishlist Button ... */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md shadow">
            {" "}
            {Math.round(discountPercentage * 100)}% {tierName} Discount{" "}
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          {" "}
          {currentVariation && (
            <WishlistButton
              variationId={currentVariation.id}
              productName={product.productName}
            />
          )}{" "}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6">
          {/* Product Image - Left */}
          <div className="p-4 md:p-6 flex items-center bg-muted/30 dark:bg-muted/10">
            <div className="w-full">
              {" "}
              <ProductImage
                imageUrl={selectedVariationImage || product.productImgUrl}
                productName={product.productName}
              />{" "}
            </div>
          </div>

          {/* Product Details - Right */}
          <div className="p-6 md:p-8 text-foreground flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {product.productName}
            </h1>

            {/* Price display */}
            <div className="mb-3">
              {/* ... price logic ... */}
              {hasDiscount && currentVariation ? (
                <>
                  {" "}
                  <p className="text-xl lg:text-2xl font-semibold text-red-600 dark:text-red-500">
                    {" "}
                    R{(discountedVariationPrice! * quantity).toFixed(2)}{" "}
                    {quantity > 1 && (
                      <span className="text-base font-normal ml-2">
                        {" "}
                        (R{discountedVariationPrice!.toFixed(2)} each){" "}
                      </span>
                    )}{" "}
                  </p>{" "}
                  <p className="text-sm text-muted-foreground line-through">
                    {" "}
                    Original: R
                    {(currentVariation.price * quantity).toFixed(2)}{" "}
                  </p>{" "}
                  <p className="text-xs text-muted-foreground">
                    {" "}
                    {tierName} member price (
                    {Math.round(discountPercentage * 100)}% off){" "}
                  </p>{" "}
                </>
              ) : (
                <p className="text-xl lg:text-2xl font-semibold">
                  {" "}
                  R
                  {(currentVariation
                    ? currentVariation.price * quantity
                    : product.sellingPrice * quantity
                  ).toFixed(2)}{" "}
                  {quantity > 1 && (
                    <span className="text-base font-normal text-muted-foreground ml-2">
                      {" "}
                      (R
                      {(
                        currentVariation?.price || product.sellingPrice
                      ).toFixed(2)}{" "}
                      each){" "}
                    </span>
                  )}{" "}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6 text-sm text-muted-foreground flex-grow">
              {" "}
              <p>{product.description}</p>{" "}
            </div>

            {/* Variation Selector */}
            <div className="mb-6">
              {" "}
              <VariationSelector
                variations={product.variations}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorSelect={handleColorSelect}
                onSizeSelect={handleSizeSelect}
                currentVariation={currentVariation}
              />{" "}
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                {" "}
                Quantity{" "}
              </label>
              <div className="flex items-center">
                {/* ... quantity buttons ... */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-r-none border-r-0"
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  disabled={
                    !currentVariation ||
                    currentVariation.quantity <= 0 ||
                    isAddingToCart ||
                    quantity <= 1
                  }
                >
                  {" "}
                  <span className="text-lg">−</span>{" "}
                </Button>

                {/* --- ADDED type to 'e' --- */}
                <Input
                  type="number"
                  id="quantity"
                  className="w-16 h-10 text-center border-x border-border bg-background text-foreground focus:outline-none focus:ring-0 rounded-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max={currentVariation?.quantity || 1}
                  value={quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // <<< Type added here
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) {
                      setQuantity(1);
                    } else if (val < 1) {
                      setQuantity(1);
                    } else if (
                      currentVariation &&
                      val > currentVariation.quantity
                    ) {
                      setQuantity(currentVariation.quantity);
                    } else {
                      setQuantity(val);
                    }
                  }}
                  disabled={
                    !currentVariation ||
                    currentVariation.quantity <= 0 ||
                    isAddingToCart
                  }
                />
                {/* --- End Type Add --- */}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-l-none border-l-0"
                  onClick={() => {
                    if (currentVariation) {
                      setQuantity(
                        quantity < currentVariation.quantity
                          ? quantity + 1
                          : currentVariation.quantity,
                      );
                    }
                  }}
                  disabled={
                    !currentVariation ||
                    currentVariation.quantity <= 0 ||
                    (currentVariation &&
                      quantity >= currentVariation.quantity) ||
                    isAddingToCart
                  }
                >
                  {" "}
                  <span className="text-lg">+</span>{" "}
                </Button>
              </div>
            </div>

            {/* Add to cart button */}
            <Button
              className="mt-auto w-full"
              size="lg"
              disabled={
                !currentVariation ||
                currentVariation.quantity <= 0 ||
                isAddingToCart ||
                quantity > (currentVariation?.quantity ?? 0)
              }
              onClick={handleAddToCart}
            >
              {isAddingToCart && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentVariation && currentVariation.quantity <= 0
                ? "Out of Stock"
                : isAddingToCart
                  ? "Adding..."
                  : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// app/(public)/productId/[product_id]/_components/ProductDetails.tsx
"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useProductDetails } from "../useProductDetails"; // Adjust path if needed
import ProductImage from "./ProductImage";
import VariationSelector from "./VariationSelector";
import ProductStatus from "./ProductStatus";
import WishlistButton from "./WishlistButton";
import { useTierDiscount } from "@/app/(public)/(group-products)/_components/(filterside)/tier-util";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator"; // Can remove if not used
import { Skeleton } from "@/components/ui/skeleton";

// formatCurrency Helper Function
const formatCurrency = (amount: number | null | undefined) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "R0,00";
  }
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" })
    .format(amount)
    .replace("ZAR", "R")
    .replace(".", ",");
};

// Interfaces
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
  addToCartAction: (formData: {
    variationId: string;
    quantity: number;
  }) => Promise<AddToCartResult>;
}

export default function ProductDetails({
  addToCartAction,
}: ProductDetailsProps) {
  const params = useParams();
  const productIdParam = params?.product_id || params?.productId;

  // --- State ---
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariationImage, setSelectedVariationImage] = useState<
    string | null
  >(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // --- Hooks ---
  const { hasDiscount, calculatePrice, userTier, discountPercentage } =
    useTierDiscount();
  const { product, isLoading, error } = useProductDetails({
    productId: productIdParam as string | null,
    autoLoad: true,
  });

  // --- Memos ---
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
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  // --- Effects ---
  useEffect(() => {
    if (product?.variations?.length) {
      const first = product.variations[0];
      if (!selectedColor || !selectedSize) {
        setSelectedColor(first.color);
        setSelectedSize(first.size);
        setSelectedVariationImage(first.imageUrl);
        setQuantity(1);
      }
    }
  }, [product, selectedColor, selectedSize]);
  useEffect(() => {
    if (currentVariation) {
      setSelectedVariationImage(currentVariation.imageUrl);
    }
    if (!currentVariation && selectedColor && selectedSize) {
      setQuantity(1);
    }
  }, [currentVariation, selectedColor, selectedSize]);

  // --- Handlers ---
  const handleColorSelect = (color: string): void => {
    setSelectedColor(color);
    if (!product?.variations) return;
    const vfc = product.variations.filter((v) => v.color === color);
    const sfc = vfc.map((v) => v.size);
    const fas = sfc[0];
    const ns = sfc.includes(selectedSize as string) ? selectedSize : fas;
    setSelectedSize(ns);
    const v = vfc.find((v) => v.size === ns);
    if (v) {
      setSelectedVariationImage(v.imageUrl);
    }
    setQuantity(1);
  };
  const handleSizeSelect = (size: string): void => {
    setSelectedSize(size);
    const v = product?.variations?.find(
      (v) => v.color === selectedColor && v.size === size,
    );
    if (v) {
      setSelectedVariationImage(v.imageUrl);
    }
    setQuantity(1);
  };
  const handleAddToCart = async (buyNow = false) => {
    if (!currentVariation) {
      toast.error("Please select options.");
      return;
    }
    if (quantity <= 0 || quantity > currentVariation.quantity) {
      toast.error("Invalid quantity or exceeds stock.");
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
          import("../../../productId/cart/_store/cart-store").then((m) =>
            m.useCartStore.getState().refreshCart(true),
          );
        }
        if (buyNow) {
          window.location.href = "/checkout";
        }
      } else {
        toast.error(result.message || "Failed.");
      }
    } catch (err) {
      toast.error("Failed to add.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 animate-pulse p-1">
        <div className="md:col-span-2">
          <Skeleton className="aspect-square w-full bg-muted rounded-lg" />
        </div>
        <div className="md:col-span-3 space-y-4 p-6 md:p-8">
          {" "}
          {/* Adjusted spacing */}
          <Skeleton className="h-8 w-3/4 bg-muted" />{" "}
          <Skeleton className="h-6 w-1/4 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />{" "}
          <Skeleton className="h-4 w-5/6 bg-muted" />
          <Skeleton className="h-16 w-full bg-muted" />{" "}
          <Skeleton className="h-12 w-full bg-muted" /> {/* Reduced height */}
          <div className="flex gap-3 mt-auto pt-2">
            {" "}
            <Skeleton className="h-11 flex-1 bg-muted rounded-md" />{" "}
            <Skeleton className="h-11 flex-1 bg-muted rounded-md" />{" "}
          </div>
        </div>
      </div>
    ); // <<< Ensure closing parenthesis
  }

  // --- Error or Product Not Found State ---
  if (error || !product) {
    return (
      // <<< Wrap ProductStatus for clarity
      <ProductStatus
        isLoading={false}
        error={error}
        productId={productIdParam as string | null}
        isProductFound={false}
      />
    ); // <<< Ensure closing parenthesis
  }

  // --- No Variations State ---
  if (!product.variations || product.variations.length === 0) {
    return (
      // <<< Wrap no variations message
      <div className="max-w-4xl mx-auto">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border overflow-hidden relative p-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {product.productName}
          </h1>
          <p className="text-muted-foreground">
            This product is currently unavailable.
          </p>
        </div>
      </div>
    ); // <<< Ensure closing parenthesis
  }

  // --- Main Render ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 bg-card text-card-foreground rounded-lg shadow-sm border border-border overflow-hidden p-1">
        {/* Image Column */}
        <div className="md:col-span-2 relative p-4 md:p-6 self-start">
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow">
              {" "}
              {Math.round(discountPercentage * 100)}% {tierName} Discount{" "}
            </div>
          )}
          <ProductImage
            imageUrl={selectedVariationImage || product.productImgUrl}
            productName={product.productName}
          />
          <div className="absolute top-2 right-2 z-10">
            {currentVariation && (
              <WishlistButton
                variationId={currentVariation.id}
                productName={product.productName}
                className="bg-card/70 hover:bg-card/90 backdrop-blur-sm"
              />
            )}
          </div>
        </div>

        {/* Details Column */}
        <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {product.productName}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < 4
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted stroke-muted-foreground"
                }
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">(4.5)</span>
          </div>

          {/* Price display */}
          <div className="mb-4">
            {hasDiscount && currentVariation ? (
              <>
                <p className="text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-500">
                  {" "}
                  {formatCurrency(discountedVariationPrice)}{" "}
                </p>
                <p className="text-sm text-muted-foreground line-through mt-0.5">
                  {" "}
                  {formatCurrency(currentVariation.price)}{" "}
                </p>
              </>
            ) : (
              <p className="text-2xl lg:text-3xl font-bold">
                {" "}
                {formatCurrency(
                  currentVariation
                    ? currentVariation.price
                    : product.sellingPrice,
                )}{" "}
              </p>
            )}
          </div>
          {hasDiscount && (
            <p className="text-xs text-muted-foreground -mt-4 mb-5">
              {" "}
              {tierName} member price{" "}
            </p>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
            {product.description}
          </p>

          {/* Basic Info Table REMOVED */}

          {/* Variation Selector */}
          <div className="mb-5">
            <VariationSelector
              variations={product.variations}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onColorSelect={handleColorSelect}
              onSizeSelect={handleSizeSelect}
              currentVariation={currentVariation}
            />
          </div>

          {/* Quantity Selector */}
          <div className="mb-5">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              {" "}
              Quantity{" "}
            </label>
            <div className="flex items-center w-fit">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-r-none border-r-0"
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
              <Input
                type="number"
                id="quantity"
                className="w-14 h-9 text-center border-y border-border bg-background text-foreground focus:outline-none focus:ring-0 rounded-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
                max={currentVariation?.quantity || 1}
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 1) {
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
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-none border-l-0"
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
                  (currentVariation && quantity >= currentVariation.quantity) ||
                  isAddingToCart
                }
              >
                {" "}
                <span className="text-lg">+</span>{" "}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={
                !currentVariation ||
                currentVariation.quantity <= 0 ||
                isAddingToCart ||
                quantity > (currentVariation?.quantity ?? 0)
              }
              onClick={() => handleAddToCart(false)}
            >
              {isAddingToCart ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {currentVariation && currentVariation.quantity <= 0
                ? "Out of Stock"
                : isAddingToCart
                  ? "Adding..."
                  : "Add to Cart"}
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={
                !currentVariation ||
                currentVariation.quantity <= 0 ||
                isAddingToCart ||
                quantity > (currentVariation?.quantity ?? 0)
              }
              onClick={() => handleAddToCart(true)}
            >
              Buy Now
            </Button>
          </div>
        </div>
        {/* End Details Column */}
      </div>
      {/* End Grid */}
    </div> // End Max Width Container
  ); // <<< FINAL Closing Parenthesis
} // <<< FINAL Closing Brace

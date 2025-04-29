"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useProductDetails } from "../useProductDetails";
import ProductImage from "./ProductImage";
import VariationSelector from "./VariationSelector";
import ImageThumbnailSelector from "./ImageThumbnailSelector"; // Import gallery component
import ProductStatus from "./ProductStatus";
import WishlistButton from "./WishlistButton";
import { useTierDiscount } from "@/app/(public)/(group-products)/_components/(filterside)/tier-util";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// formatCurrency Helper Function
const formatCurrency = (amount: number | null | undefined): string => {
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

  // State
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedGalleryImageUrl, setSelectedGalleryImageUrl] = useState<
    string | null
  >(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // Hooks
  const { hasDiscount, calculatePrice, userTier, discountPercentage } =
    useTierDiscount();
  const { product, isLoading, error } = useProductDetails({
    productId: productIdParam as string | null,
    autoLoad: true,
  });

  // Determine Display Mode
  const isGalleryMode = useMemo(() => {
    if (!product?.variations || product.variations.length <= 1) return false;
    const firstColor = product.variations[0].color;
    const firstSize = product.variations[0].size;
    return product.variations.every(
      (v) => v.color === firstColor && v.size === firstSize,
    );
    // Replace with `product?.variationDisplayMode === 'ImageGallery'` if using the flag
  }, [product]);

  // Memos
  const currentVariation = useMemo<Variation | null>(() => {
    if (
      isGalleryMode ||
      !product?.variations ||
      !selectedColor ||
      !selectedSize
    )
      return null;
    return (
      product.variations.find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      ) || null
    );
  }, [product, selectedColor, selectedSize, isGalleryMode]);

  const primaryVariationForCart = useMemo<Variation | null>(() => {
    if (!product?.variations || product.variations.length === 0) return null;
    return product.variations[0];
  }, [product]);

  const displayVariationForPriceAndStock = isGalleryMode
    ? primaryVariationForCart
    : currentVariation;

  const discountedVariationPrice = useMemo(() => {
    if (!displayVariationForPriceAndStock) return null;
    return calculatePrice(displayVariationForPriceAndStock.price);
  }, [displayVariationForPriceAndStock, calculatePrice]);

  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  // Effects
  useEffect(() => {
    setSelectedGalleryImageUrl(null);

    if (!isGalleryMode && product?.variations?.length) {
      if (product.variations.length === 1) {
        const uniqueVariation = product.variations[0];
        setSelectedColor(uniqueVariation.color);
        setSelectedSize(uniqueVariation.size);
      } else if (selectedColor === null && selectedSize === null) {
        setSelectedColor(null);
        setSelectedSize(null);
      }
    } else if (!isGalleryMode) {
      setSelectedColor(null);
      setSelectedSize(null);
    }
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isGalleryMode]);

  // Handlers
  const handleColorSelect = (color: string): void => {
    if (isGalleryMode) return;
    setSelectedColor(color);
    if (!product?.variations) return;
    const variationsWithNewColor = product.variations.filter(
      (v) => v.color === color,
    );
    const availableSizesForNewColor = variationsWithNewColor.map((v) => v.size);
    const newSize = availableSizesForNewColor.includes(selectedSize as string)
      ? selectedSize
      : (availableSizesForNewColor[0] ?? null);
    setSelectedSize(newSize);
    setQuantity(1);
  };

  const handleSizeSelect = (size: string): void => {
    if (isGalleryMode) return;
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleGalleryImageSelect = (imageUrl: string): void => {
    setSelectedGalleryImageUrl(imageUrl);
  };

  const handleAddToCart = async (buyNow = false) => {
    const variationToAdd = isGalleryMode
      ? primaryVariationForCart
      : currentVariation;
    if (!variationToAdd) {
      toast.error(
        "Please select valid product options or product is unavailable.",
      );
      return;
    }
    if (quantity <= 0 || quantity > variationToAdd.quantity) {
      toast.error("Invalid quantity selected or exceeds available stock.");
      return;
    }
    setIsAddingToCart(true);
    try {
      const result = await addToCartAction({
        variationId: variationToAdd.id,
        quantity: quantity,
      });
      if (result.success) {
        toast.success(result.message || `Added ${quantity} item(s) to cart`, {
          description: product?.productName,
          duration: 3000,
        });
        if (typeof window !== "undefined") {
          import("../../../productId/cart/_store/cart-store").then((m) =>
            m.useCartStore.getState().refreshCart(true),
          );
        }
        if (buyNow && typeof window !== "undefined") {
          window.location.href = "/checkout";
        }
      } else {
        toast.error(result.message || "Failed to add item to cart.");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("An error occurred while adding the item to the cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // --- Loading / Error / No Variations States ---
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 animate-pulse p-1">
        <div className="md:col-span-2">
          {" "}
          <Skeleton className="aspect-square w-full bg-muted rounded-lg" />{" "}
        </div>
        <div className="md:col-span-3 space-y-4 p-6 md:p-8">
          <Skeleton className="h-8 w-3/4 bg-muted" />{" "}
          <Skeleton className="h-6 w-1/4 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />{" "}
          <Skeleton className="h-4 w-5/6 bg-muted" />
          <Skeleton className="h-16 w-full bg-muted" />{" "}
          <Skeleton className="h-12 w-full bg-muted" />
          <div className="flex gap-3 mt-auto pt-2">
            {" "}
            <Skeleton className="h-11 flex-1 bg-muted rounded-md" />{" "}
            <Skeleton className="h-11 flex-1 bg-muted rounded-md" />{" "}
          </div>
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <ProductStatus
        isLoading={false}
        error={error}
        productId={productIdParam as string | null}
        isProductFound={false}
      />
    );
  }
  if (!product.variations || product.variations.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 bg-card text-card-foreground rounded-lg shadow-sm border border-border overflow-hidden p-1">
          <div className="md:col-span-2 relative p-4 md:p-6 self-start">
            {" "}
            <ProductImage
              imageUrl={product.productImgUrl}
              productName={product.productName}
            />{" "}
          </div>
          <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {" "}
              {product.productName}{" "}
            </h1>
            <p className="text-2xl lg:text-3xl font-bold mb-4">
              {" "}
              {formatCurrency(product.sellingPrice)}{" "}
            </p>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
              {" "}
              {product.description}{" "}
            </p>
            <div className="mt-auto pt-4 border-t border-border">
              {" "}
              <p className="text-center text-muted-foreground font-medium">
                {" "}
                This product is currently unavailable or has no selectable
                options.{" "}
              </p>{" "}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine image to show in the main display
  const mainDisplayImageUrl = isGalleryMode
    ? selectedGalleryImageUrl || product.productImgUrl
    : currentVariation?.imageUrl || product.productImgUrl;

  // --- Main Render ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 bg-card text-card-foreground rounded-lg shadow-sm border border-border overflow-hidden p-1">
        {/* Image Column (LEFT) */}
        <div className="md:col-span-2 relative p-4 md:p-6 self-start flex flex-col">
          {" "}
          {/* Added flex flex-col */}
          {/* Discount Badge */}
          {hasDiscount && displayVariationForPriceAndStock && (
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow">
              {Math.round(discountPercentage * 100)}% {tierName} Discount
            </div>
          )}
          {/* Main Product Image */}
          <ProductImage
            imageUrl={mainDisplayImageUrl}
            productName={product.productName}
          />
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 z-10">
            {primaryVariationForCart && (
              <WishlistButton
                variationId={primaryVariationForCart.id}
                productName={product.productName}
                className="bg-card/70 hover:bg-card/90 backdrop-blur-sm"
              />
            )}
          </div>
          {/* Image Thumbnail Selector (Conditionally Rendered Below Image) */}
          {isGalleryMode &&
            product.variations &&
            product.variations.length > 0 && ( // Ensure variations exist
              <div className="mt-4 w-full">
                <ImageThumbnailSelector
                  variations={product.variations}
                  productImageUrl={product.productImgUrl}
                  selectedImageUrl={selectedGalleryImageUrl}
                  onImageSelect={handleGalleryImageSelect}
                />
              </div>
            )}
        </div>{" "}
        {/* End Image Column */}
        {/* Details Column (RIGHT) */}
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
          {/* Price Display */}
          <div className="mb-4 min-h-[3.5rem]">
            {displayVariationForPriceAndStock ? (
              hasDiscount ? (
                <>
                  <p className="text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-500">
                    {" "}
                    {formatCurrency(discountedVariationPrice)}{" "}
                  </p>
                  <p className="text-sm text-muted-foreground line-through mt-0.5">
                    {" "}
                    {formatCurrency(
                      displayVariationForPriceAndStock.price,
                    )}{" "}
                  </p>
                </>
              ) : (
                <p className="text-2xl lg:text-3xl font-bold">
                  {" "}
                  {formatCurrency(displayVariationForPriceAndStock.price)}{" "}
                </p>
              )
            ) : (
              <p className="text-2xl lg:text-3xl font-bold">
                {" "}
                {formatCurrency(product.sellingPrice)}{" "}
              </p>
            )}
          </div>
          {hasDiscount && displayVariationForPriceAndStock && (
            <p className="text-xs text-muted-foreground -mt-4 mb-5">
              {tierName} member price
            </p>
          )}
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
            {product.description}
          </p>

          {/* Variation Selector (Conditionally Rendered) */}
          <div className="mb-5">
            {!isGalleryMode &&
              product.variations &&
              product.variations.length > 0 && ( // Only render if NOT gallery mode AND variations exist
                <VariationSelector
                  variations={product.variations}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  onColorSelect={handleColorSelect}
                  onSizeSelect={handleSizeSelect}
                  currentVariation={currentVariation}
                />
              )}
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
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={
                  !(isGalleryMode
                    ? primaryVariationForCart
                    : currentVariation) ||
                  (isGalleryMode ? primaryVariationForCart : currentVariation)!
                    .quantity <= 0 ||
                  isAddingToCart ||
                  quantity <= 1
                }
                aria-label="Decrease quantity"
              >
                {" "}
                <span className="text-lg">−</span>{" "}
              </Button>
              <Input
                type="number"
                id="quantity"
                className="w-14 h-9 text-center border-y border-border bg-background text-foreground focus:outline-none focus:ring-0 rounded-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
                max={
                  (isGalleryMode ? primaryVariationForCart : currentVariation)
                    ?.quantity ?? 1
                }
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const maxQty =
                    (isGalleryMode ? primaryVariationForCart : currentVariation)
                      ?.quantity ?? 1;
                  let val = parseInt(e.target.value);
                  if (isNaN(val) || val < 1) {
                    val = 1;
                  } else if (val > maxQty) {
                    val = maxQty;
                  }
                  setQuantity(val);
                }}
                disabled={
                  !(isGalleryMode
                    ? primaryVariationForCart
                    : currentVariation) ||
                  (isGalleryMode ? primaryVariationForCart : currentVariation)!
                    .quantity <= 0 ||
                  isAddingToCart
                }
                aria-label="Product quantity"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-none border-l-0"
                onClick={() => {
                  const maxQty =
                    (isGalleryMode ? primaryVariationForCart : currentVariation)
                      ?.quantity ?? 1;
                  setQuantity(Math.min(maxQty, quantity + 1));
                }}
                disabled={
                  !(isGalleryMode
                    ? primaryVariationForCart
                    : currentVariation) ||
                  (isGalleryMode ? primaryVariationForCart : currentVariation)!
                    .quantity <= 0 ||
                  quantity >=
                    ((isGalleryMode
                      ? primaryVariationForCart
                      : currentVariation
                    )?.quantity ?? 1) ||
                  isAddingToCart
                }
                aria-label="Increase quantity"
              >
                {" "}
                <span className="text-lg">+</span>{" "}
              </Button>
            </div>
            {/* Stock Display */}
            {(isGalleryMode ? primaryVariationForCart : currentVariation) && (
              <p
                className={cn(
                  "text-xs mt-1.5",
                  (isGalleryMode ? primaryVariationForCart : currentVariation)!
                    .quantity > 0
                    ? "text-green-600"
                    : "text-red-600",
                )}
              >
                {(isGalleryMode ? primaryVariationForCart : currentVariation)!
                  .quantity > 0
                  ? `In Stock (${(isGalleryMode ? primaryVariationForCart : currentVariation)!.quantity} available)`
                  : "Out of Stock"}
              </p>
            )}
            {/* Unavailable message */}
            {!isGalleryMode &&
              !currentVariation &&
              selectedColor &&
              selectedSize && (
                <p className="text-xs mt-1.5 text-destructive">
                  {" "}
                  Selected combination unavailable.{" "}
                </p>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={
                !(isGalleryMode ? primaryVariationForCart : currentVariation) ||
                (isGalleryMode ? primaryVariationForCart : currentVariation)!
                  .quantity <= 0 ||
                isAddingToCart ||
                quantity >
                  ((isGalleryMode ? primaryVariationForCart : currentVariation)
                    ?.quantity ?? 0)
              }
              onClick={() => handleAddToCart(false)}
            >
              {isAddingToCart ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {(isGalleryMode ? primaryVariationForCart : currentVariation) &&
              (isGalleryMode ? primaryVariationForCart : currentVariation)!
                .quantity <= 0
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
                !(isGalleryMode ? primaryVariationForCart : currentVariation) ||
                (isGalleryMode ? primaryVariationForCart : currentVariation)!
                  .quantity <= 0 ||
                isAddingToCart ||
                quantity >
                  ((isGalleryMode ? primaryVariationForCart : currentVariation)
                    ?.quantity ?? 0)
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
  );
}

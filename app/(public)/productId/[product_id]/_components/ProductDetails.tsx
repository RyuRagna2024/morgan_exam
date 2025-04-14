"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useProductDetails } from "../useProductDetails";
import { useProductStore } from "../../../(group-products)/_components/_store/product-store";
import ProductImage from "./ProductImage";
import VariationSelector from "./VariationSelector";
import ProductStatus from "./ProductStatus";
import WishlistButton from "./WishlistButton";
import { useTierDiscount } from "@/app/(public)/(group-products)/_components/(filterside)/tier-util";

// Define types
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
  updateCartItemAction?: (formData: {
    cartItemId: string;
    quantity: number;
  }) => Promise<AddToCartResult>;
  clearCartAction?: () => Promise<{ success: boolean; message: string }>;
}

export default function ProductDetails({
  initialProductId,
  addToCartAction,
  updateCartItemAction,
  clearCartAction,
}: ProductDetailsProps) {
  const params = useParams();
  const [isStoreReady, setIsStoreReady] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariationImage, setSelectedVariationImage] = useState<
    string | null
  >(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // Get tier discount information
  const { hasDiscount, calculatePrice, userTier, discountPercentage } =
    useTierDiscount();

  // Get store data
  const allProducts = useProductStore((state) => state.allProducts);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  // Get product ID from params or props
  const productId = useMemo<string | null>(() => {
    // First priority: Use initialProductId if provided
    if (initialProductId) return initialProductId;

    // Second priority: Check URL params
    if (!params) return null;

    // Try different possible param names
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
      // Try to find any param that looks like a UUID
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

  // Initialize store
  useEffect(() => {
    if (allProducts.length === 0) {
      fetchProducts().then(() => setIsStoreReady(true));
    } else {
      setIsStoreReady(true);
    }
  }, [allProducts, fetchProducts]);

  // Get product details
  const { product, isLoading, error } = useProductDetails({
    productId: isStoreReady ? productId : null,
    autoLoad: true,
  });

  // Get current variation
  const currentVariation = useMemo<Variation | null>(() => {
    if (!product?.variations || !selectedColor || !selectedSize) {
      return null;
    }

    return (
      product.variations.find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      ) || null
    );
  }, [product, selectedColor, selectedSize]);

  // Calculate discounted prices based on user tier
  const discountedVariationPrice = useMemo(() => {
    if (!currentVariation) return null;
    return calculatePrice(currentVariation.price);
  }, [currentVariation, calculatePrice]);

  const discountedBasePrice = useMemo(() => {
    if (!product) return null;
    return calculatePrice(product.sellingPrice);
  }, [product, calculatePrice]);

  // Set default selections when product loads, but don't reset quantity
  useEffect(() => {
    if (product?.variations?.length) {
      const firstVariation = product.variations[0];
      setSelectedColor(firstVariation.color);
      setSelectedSize(firstVariation.size);
      setSelectedVariationImage(firstVariation.imageUrl);
      // Removed the setQuantity(1) line to preserve quantity
    }
  }, [product]);

  // Update variation image when current variation changes
  useEffect(() => {
    if (currentVariation) {
      setSelectedVariationImage(currentVariation.imageUrl);
    }
  }, [currentVariation]);

  // Handle color selection
  const handleColorSelect = (color: string): void => {
    setSelectedColor(color);

    if (!product?.variations) return;

    // Find sizes available for this color
    const variationsForColor = product.variations.filter(
      (v) => v.color === color,
    );
    const sizesForColor = variationsForColor.map((v) => v.size);

    // If current size isn't available, select the first one
    if (!sizesForColor.includes(selectedSize as string)) {
      setSelectedSize(sizesForColor[0]);
    }

    // Find the specific variation to get its image
    const variation = variationsForColor.find(
      (v) =>
        v.size ===
        (sizesForColor.includes(selectedSize as string)
          ? selectedSize
          : sizesForColor[0]),
    );

    if (variation) {
      setSelectedVariationImage(variation.imageUrl);
    }
  };

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!currentVariation) return;

    setIsAddingToCart(true);

    try {
      const result = await addToCartAction({
        variationId: currentVariation.id,
        quantity: quantity,
      });

      if (result.success) {
        // Use Sonner toast with more detailed information
        toast.success(`Added ${quantity} item(s) to cart`, {
          description: currentVariation.name || product?.productName,
          duration: 3000,
        });

        // Force refresh the cart state to ensure UI updates immediately
        // This ensures the cart count badge in the navbar updates right away
        try {
          // We're importing and using the cart store directly
          if (typeof window !== "undefined") {
            // Only run on client side
            import("../../../productId/cart/_store/cart-store")
              .then((module) => {
                const cartStore = module.useCartStore;
                cartStore.getState().refreshCart(true);
              })
              .catch((e) => console.error("Error importing cart store:", e));
          }
        } catch (e) {
          console.error("Error refreshing cart:", e);
        }

        // Not resetting quantity to 1 here to preserve the user's selection
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Add to cart error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Check loading, error, and not found states
  const showStatus = !isStoreReady || isLoading || error || !product;
  if (showStatus) {
    return (
      <ProductStatus
        isLoading={!isStoreReady || isLoading}
        error={error}
        productId={productId}
        isProductFound={!!product}
      />
    );
  }

  // Format the tier name for display
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  // No variations
  if (!product.variations || product.variations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden relative">
          {/* Tier Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md">
              {Math.round(discountPercentage * 100)}% {tierName} Discount
            </div>
          )}

          {/* Wishlist button in top right corner of the card */}
          <div className="absolute top-2 right-2 z-10">
            {product.id && (
              <WishlistButton
                variationId={product.id}
                productName={product.productName}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px]">
            {/* Product Image */}
            <div className="p-4 h-full flex items-center">
              <div className="w-full">
                <ProductImage
                  imageUrl={product.productImgUrl}
                  productName={product.productName}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4">
              <h1 className="text-xl font-bold mb-2">{product.productName}</h1>

              {/* Price with discount if applicable */}
              {hasDiscount ? (
                <div className="mb-2">
                  <p className="text-lg font-semibold text-red-600">
                    R{(discountedBasePrice! * quantity).toFixed(2)}
                    {quantity > 1 && (
                      <span className="text-sm ml-2">
                        (R{discountedBasePrice!.toFixed(2)} each)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 line-through">
                    Original: R{(product.sellingPrice * quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {tierName} member price (
                    {Math.round(discountPercentage * 100)}% off)
                  </p>
                </div>
              ) : (
                <p className="text-lg font-semibold mb-2">
                  R{(product.sellingPrice * quantity).toFixed(2)}
                  {quantity > 1 && (
                    <span className="text-sm text-gray-600 ml-2">
                      (R{product.sellingPrice.toFixed(2)} each)
                    </span>
                  )}
                </p>
              )}

              <div className="mb-4 text-sm">
                <p>{product.description}</p>
              </div>
              <div className="my-3 text-sm text-yellow-600">
                <p>No variations available for this product</p>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6 mb-4">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium mb-1"
                >
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="w-10 h-10 bg-gray-100 rounded-l flex items-center justify-center hover:bg-gray-200"
                    onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  >
                    <span className="text-lg">−</span>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    className="w-16 h-10 text-center border-y focus:outline-none"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val)) {
                        setQuantity(1);
                      } else if (val < 1) {
                        setQuantity(1);
                      } else {
                        setQuantity(val);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="w-10 h-10 bg-gray-100 rounded-r flex items-center justify-center hover:bg-gray-200"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>

              <button
                className={`mt-3 w-full bg-black text-white py-2 rounded hover:bg-gray-800 ${
                  isAddingToCart ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  // We can't use server actions here since there's no variation
                  console.log("Adding to cart:", {
                    productId: product.id,
                    productName: product.productName,
                    quantity: quantity,
                    price: product.sellingPrice,
                  });
                  toast.error(
                    "This product cannot be added to cart as it has no variations",
                  );
                }}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden relative">
        {/* Tier Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md">
            {Math.round(discountPercentage * 100)}% {tierName} Discount
          </div>
        )}

        {/* Wishlist button in top right corner of the card */}
        <div className="absolute top-2 right-2 z-10">
          {currentVariation && (
            <WishlistButton
              variationId={currentVariation.id}
              productName={product.productName}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image - Left Column */}
          <div className="p-4 h-full flex items-center">
            <div className="w-full">
              <ProductImage
                imageUrl={selectedVariationImage || product.productImgUrl}
                productName={product.productName}
              />
            </div>
          </div>

          {/* Product Details - Right Column */}
          <div className="p-4">
            <h1 className="text-xl font-bold mb-2">{product.productName}</h1>

            {/* Price display with discount if applicable */}
            {hasDiscount && currentVariation ? (
              <div className="mb-2">
                <p className="text-lg font-semibold text-red-600">
                  R{(discountedVariationPrice! * quantity).toFixed(2)}
                  {quantity > 1 && (
                    <span className="text-sm ml-2">
                      (R{discountedVariationPrice!.toFixed(2)} each)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 line-through">
                  Original: R{(currentVariation.price * quantity).toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">
                  {tierName} member price (
                  {Math.round(discountPercentage * 100)}% off)
                </p>
              </div>
            ) : (
              <p className="text-lg font-semibold mb-2">
                R
                {(currentVariation
                  ? currentVariation.price * quantity
                  : product.sellingPrice * quantity
                ).toFixed(2)}
                {quantity > 1 && (
                  <span className="text-sm text-gray-600 ml-2">
                    (R
                    {(currentVariation?.price || product.sellingPrice).toFixed(
                      2,
                    )}{" "}
                    each)
                  </span>
                )}
              </p>
            )}

            <div className="mb-4 text-sm">
              <p>{product.description}</p>
            </div>

            <VariationSelector
              variations={product.variations}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onColorSelect={handleColorSelect}
              onSizeSelect={setSelectedSize}
              currentVariation={currentVariation}
            />

            {/* Debug Info - Remove this in production */}
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-700">
              <p>Product ID: {product.id}</p>
              <p>Selected Color: {selectedColor}</p>
              <p>Selected Size: {selectedSize}</p>
              <p>Variation ID: {currentVariation?.id || "none"}</p>
              <p>
                Image: {selectedVariationImage?.split("/").pop() || "(default)"}
              </p>
              {hasDiscount && (
                <>
                  <p>User Tier: {tierName}</p>
                  <p>Discount: {Math.round(discountPercentage * 100)}%</p>
                  <p>
                    Original Price: R
                    {currentVariation?.price.toFixed(2) || "N/A"}
                  </p>
                  <p>
                    Discounted Price: R
                    {discountedVariationPrice?.toFixed(2) || "N/A"}
                  </p>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium mb-1"
              >
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-100 rounded-l flex items-center justify-center hover:bg-gray-200"
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  disabled={
                    !currentVariation ||
                    currentVariation.quantity <= 0 ||
                    isAddingToCart
                  }
                >
                  <span className="text-lg">−</span>
                </button>
                <input
                  type="number"
                  id="quantity"
                  className="w-16 h-10 text-center border-y focus:outline-none"
                  min="1"
                  max={currentVariation?.quantity || 1}
                  value={quantity}
                  onChange={(e) => {
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
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-100 rounded-r flex items-center justify-center hover:bg-gray-200"
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
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              className={`mt-3 w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed ${
                isAddingToCart ? "opacity-70" : ""
              }`}
              disabled={
                !currentVariation ||
                currentVariation.quantity <= 0 ||
                isAddingToCart
              }
              onClick={handleAddToCart}
            >
              {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

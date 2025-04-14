import { useEffect, useState } from "react";
import { useProductStore } from "../../(group-products)/_components/_store/product-store";
import { ProductWithVariations } from "../../(group-products)/_components/(filterside)/types";

interface UseProductDetailsParams {
  productId: string | null;
  autoLoad?: boolean;
}

interface UseProductDetailsResult {
  product: ProductWithVariations | null;
  isLoading: boolean;
  error: string | null;
  fetchProduct: (id: string) => Promise<ProductWithVariations | null>;
  clearProduct: () => void;
  getRelatedProducts: (limit?: number) => ProductWithVariations[];
}

/**
 * Custom hook to manage product details from the store
 * Provides functionality to fetch, clear and access product details
 */
export function useProductDetails({
  productId,
  autoLoad = true,
}: UseProductDetailsParams): UseProductDetailsResult {
  // Local state for tracking initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Get store methods and state
  const currentProduct = useProductStore((state) => state.currentProduct);
  const isLoadingProduct = useProductStore((state) => state.isLoadingProduct);
  const productError = useProductStore((state) => state.productError);
  const fetchProductById = useProductStore((state) => state.fetchProductById);
  const clearCurrentProduct = useProductStore(
    (state) => state.clearCurrentProduct,
  );
  const allProducts = useProductStore((state) => state.allProducts);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  // Initialize the store if needed
  useEffect(() => {
    // If we don't have any products loaded yet, fetch them first
    if (allProducts.length === 0) {
      console.log("No products in store, fetching all products first");
      fetchProducts().then(() => {
        setIsInitialized(true);
        console.log("All products fetched, store initialized");
      });
    } else {
      setIsInitialized(true);
      console.log("Store already has products, initialization skipped");
    }
  }, [allProducts.length, fetchProducts]);

  // Fetch the specific product when ready
  useEffect(() => {
    // Only proceed if we're initialized and have a productId
    if (isInitialized && productId && autoLoad) {
      console.log(`Fetching product with ID: ${productId}`);

      // Add debug logging for the current state
      console.log("Current product in store:", currentProduct?.id);
      console.log(
        "All product IDs in store:",
        allProducts.map((p) => p.id),
      );

      fetchProductById(productId).then((result) => {
        if (result) {
          console.log("Product fetched successfully:", result.productName);
        } else {
          console.log("Product fetch returned null result");
        }
      });
    } else {
      console.log(
        `Product fetch skipped. isInitialized: ${isInitialized}, productId: ${productId}, autoLoad: ${autoLoad}`,
      );
    }

    // Clean up when component unmounts or productId changes
    return () => {
      if (productId) {
        console.log(`Cleaning up for product ID: ${productId}`);
      }
    };
  }, [
    productId,
    autoLoad,
    fetchProductById,
    isInitialized,
    currentProduct?.id,
    allProducts,
  ]);

  /**
   * Get related products based on same category
   */
  const getRelatedProducts = (limit: number = 4): ProductWithVariations[] => {
    if (!currentProduct) return [];

    // Find products in the same categories
    const sameCategory = allProducts.filter(
      (product) =>
        product.id !== currentProduct.id && // Exclude current product
        product.category.some((cat) => currentProduct.category.includes(cat)),
    );

    // If we don't have enough related products by category, add some random ones
    if (sameCategory.length < limit) {
      const otherProducts = allProducts.filter(
        (product) =>
          product.id !== currentProduct.id &&
          !sameCategory.some(
            (relatedProduct) => relatedProduct.id === product.id,
          ),
      );

      // Randomize and take what we need
      const randomProducts = [...otherProducts]
        .sort(() => 0.5 - Math.random())
        .slice(0, limit - sameCategory.length);

      return [...sameCategory, ...randomProducts].slice(0, limit);
    }

    // If we have more than we need, randomize and take the limit
    return [...sameCategory].sort(() => 0.5 - Math.random()).slice(0, limit);
  };

  // Enhanced fetch function with better error handling
  const fetchProduct = async (id: string) => {
    console.log(`Manual fetch triggered for product ID: ${id}`);
    try {
      const result = await fetchProductById(id);
      console.log("Fetch result:", result);
      return result;
    } catch (error) {
      console.error("Error in fetchProduct:", error);
      return null;
    }
  };

  return {
    product: currentProduct,
    isLoading: isLoadingProduct || !isInitialized,
    error: productError,
    fetchProduct,
    clearProduct: clearCurrentProduct,
    getRelatedProducts,
  };
}

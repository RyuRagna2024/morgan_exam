// productStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  ProductActionResult,
  ProductCategory,
  ProductWithVariations,
} from "../(filterside)/types";
import { getAllProducts, getProductById } from "../(filterside)/product-fetch";

// Define stock status types
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "all";

// Define price range filter
export type PriceRange = {
  min: number;
  max: number | null; // null for no upper limit
  label: string;
};

// Define the store state type with wishlist integration
interface ProductState {
  allProducts: ProductWithVariations[];
  currentProduct: ProductWithVariations | null;
  isLoading: boolean;
  isLoadingProduct: boolean;
  error: string | null;
  productError: string | null;

  // Wishlist status for the current product
  currentProductWishlistStatus: Record<string, boolean>;

  // Filter states
  categoryFilter: ProductCategory | "all";
  priceRangeFilter: PriceRange | null;
  stockStatusFilter: StockStatus;
  colorFilters: string[];
  sizeFilters: string[];

  // Available filter options (derived from actual data)
  availableColors: string[];
  availableSizes: string[];

  // Predefined price ranges
  priceRanges: PriceRange[];

  // Actions
  fetchProducts: () => Promise<void>;
  fetchProductById: (
    productId: string,
  ) => Promise<ProductWithVariations | null>;
  clearCurrentProduct: () => void;
  setCategoryFilter: (category: ProductCategory | "all") => void;
  setPriceRangeFilter: (priceRange: PriceRange | null) => void;
  setStockStatusFilter: (status: StockStatus) => void;
  setColorFilters: (colors: string[]) => void;
  toggleColorFilter: (color: string) => void;
  setSizeFilters: (sizes: string[]) => void;
  toggleSizeFilter: (size: string) => void;

  // Set wishlist status for current product's variations
  setCurrentProductWishlistStatus: (status: Record<string, boolean>) => void;

  // Update wishlist status for a specific variation
  updateVariationWishlistStatus: (
    variationId: string,
    isInWishlist: boolean,
  ) => void;

  // Getters for filtered products
  getFilteredProducts: (pathname?: string) => ProductWithVariations[];
  getApparelProducts: () => ProductWithVariations[];
  getHeadwearProducts: () => ProductWithVariations[];
  getAllCollectionsProducts: () => ProductWithVariations[];
}

// Helper functions for filtering
const isInCategory = (
  product: ProductWithVariations,
  category: ProductCategory | "all",
): boolean => {
  if (category === "all") return true;

  const categoryVariations = [
    category,
    category.toLowerCase(),
    category.toUpperCase(),
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
  ];

  return product.category.some((cat) => categoryVariations.includes(cat));
};

const isInPriceRange = (
  product: ProductWithVariations,
  priceRange: PriceRange | null,
): boolean => {
  if (!priceRange) return true;

  const { min, max } = priceRange;
  return (
    product.sellingPrice >= min && (max === null || product.sellingPrice <= max)
  );
};

const getProductStockStatus = (product: ProductWithVariations): StockStatus => {
  // If no variations, use a default logic based on some assumption
  if (!product.variations || product.variations.length === 0) {
    return "out-of-stock";
  }

  // Calculate total quantity across all variations
  const totalQuantity = product.variations.reduce(
    (sum, variation) => sum + variation.quantity,
    0,
  );

  if (totalQuantity <= 0) return "out-of-stock";
  if (totalQuantity < 100) return "low-stock";
  return "in-stock";
};

// Check if product has ANY of the selected colors
const hasAnyColor = (
  product: ProductWithVariations,
  colors: string[],
): boolean => {
  if (!colors || colors.length === 0) return true;

  return (
    product.variations?.some((variation) =>
      colors.some(
        (color) => variation.color.toLowerCase() === color.toLowerCase(),
      ),
    ) || false
  );
};

// Updated to check if product has ANY of the selected sizes
const hasAnySize = (
  product: ProductWithVariations,
  sizes: string[],
): boolean => {
  if (!sizes || sizes.length === 0) return true;

  return (
    product.variations?.some((variation) =>
      sizes.some((size) => variation.size.toLowerCase() === size.toLowerCase()),
    ) || false
  );
};

// Create the store
export const useProductStore = create<ProductState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        allProducts: [],
        currentProduct: null,
        isLoading: false,
        isLoadingProduct: false,
        error: null,
        productError: null,

        // Wishlist status for current product
        currentProductWishlistStatus: {},

        categoryFilter: "all",
        priceRangeFilter: null,
        stockStatusFilter: "all",
        colorFilters: [],
        sizeFilters: [],

        availableColors: [],
        availableSizes: [],

        priceRanges: [
          { min: 0, max: 500, label: "Under R500" },
          { min: 500, max: 1000, label: "R500 - R1000" },
          { min: 1000, max: 2000, label: "R1000 - R2000" },
          { min: 2000, max: null, label: "R2000 & Above" },
        ],

        // Actions
        fetchProducts: async () => {
          set({ isLoading: true, error: null });

          try {
            const result: ProductActionResult = await getAllProducts();

            if (!result.success || !result.products) {
              throw new Error(result.error || "Failed to fetch products");
            }

            // Extract all unique colors and sizes from variations
            const allColors = new Set<string>();
            const allSizes = new Set<string>();

            result.products.forEach((product) => {
              product.variations?.forEach((variation) => {
                if (variation.color) {
                  allColors.add(variation.color.toLowerCase());
                }
                if (variation.size) {
                  allSizes.add(variation.size);
                }
              });
            });

            set({
              allProducts: result.products,
              isLoading: false,
              availableColors: Array.from(allColors),
              availableSizes: Array.from(allSizes),
            });
          } catch (error) {
            console.error("Error fetching products:", error);
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        },

        // New action to fetch a single product by ID with wishlist status
        fetchProductById: async (productId: string) => {
          set({ isLoadingProduct: true, productError: null });

          try {
            const result: ProductActionResult & {
              wishlistStatus?: Record<string, boolean>;
            } = await getProductById(productId);

            if (!result.success || !result.product) {
              throw new Error(result.error || "Failed to fetch product");
            }

            set({
              currentProduct: result.product,
              currentProductWishlistStatus: result.wishlistStatus || {},
              isLoadingProduct: false,
            });

            return result.product;
          } catch (error) {
            console.error(
              `Error fetching product with ID ${productId}:`,
              error,
            );
            set({
              isLoadingProduct: false,
              productError:
                error instanceof Error ? error.message : "Unknown error",
            });
            return null;
          }
        },

        // Action to clear the current product
        clearCurrentProduct: () =>
          set({
            currentProduct: null,
            currentProductWishlistStatus: {},
          }),

        // Action to set wishlist status for current product
        setCurrentProductWishlistStatus: (status: Record<string, boolean>) =>
          set({ currentProductWishlistStatus: status }),

        // Action to update wishlist status for a specific variation
        updateVariationWishlistStatus: (
          variationId: string,
          isInWishlist: boolean,
        ) => {
          const currentStatus = { ...get().currentProductWishlistStatus };
          currentStatus[variationId] = isInWishlist;
          set({ currentProductWishlistStatus: currentStatus });
        },

        setCategoryFilter: (category) => set({ categoryFilter: category }),
        setPriceRangeFilter: (priceRange) =>
          set({ priceRangeFilter: priceRange }),
        setStockStatusFilter: (status) => set({ stockStatusFilter: status }),
        setColorFilters: (colors) => set({ colorFilters: colors }),
        toggleColorFilter: (color) => {
          const { colorFilters } = get();
          const lowerCaseColor = color.toLowerCase();

          if (colorFilters.includes(lowerCaseColor)) {
            // Remove color if it's already in the filters
            set({
              colorFilters: colorFilters.filter((c) => c !== lowerCaseColor),
            });
          } else {
            // Add color to the filters
            set({
              colorFilters: [...colorFilters, lowerCaseColor],
            });
          }
        },
        setSizeFilters: (sizes) => set({ sizeFilters: sizes }),
        toggleSizeFilter: (size) => {
          const { sizeFilters } = get();
          const normalizedSize = size; // Keep original case for sizes as they might be case-sensitive (S, M, L)

          if (sizeFilters.includes(normalizedSize)) {
            // Remove size if it's already in the filters
            set({
              sizeFilters: sizeFilters.filter((s) => s !== normalizedSize),
            });
          } else {
            // Add size to the filters
            set({
              sizeFilters: [...sizeFilters, normalizedSize],
            });
          }
        },

        // Getters for filtered products
        getFilteredProducts: (pathname?: string) => {
          const {
            allProducts,
            categoryFilter,
            priceRangeFilter,
            stockStatusFilter,
            colorFilters,
            sizeFilters,
          } = get();

          // Determine active category based on pathname if provided
          let activeCategoryFilter = categoryFilter;

          if (pathname) {
            // Extract category from pathname
            const pathSegments = pathname.split("/").filter(Boolean);
            const lastSegment = pathSegments[pathSegments.length - 1];

            if (lastSegment) {
              // Check if the last segment maps to one of our known categories
              const knownCategories = [
                "apparel",
                "headwear",
                "all-collections",
              ];
              const matchedCategory = knownCategories.find(
                (cat) => lastSegment.toLowerCase() === cat,
              );

              if (matchedCategory) {
                activeCategoryFilter = matchedCategory as ProductCategory;
              }
            }
          }

          return allProducts.filter(
            (product) =>
              isInCategory(product, activeCategoryFilter) &&
              isInPriceRange(product, priceRangeFilter) &&
              (stockStatusFilter === "all" ||
                getProductStockStatus(product) === stockStatusFilter) &&
              hasAnyColor(product, colorFilters) &&
              hasAnySize(product, sizeFilters),
          );
        },

        getApparelProducts: () => {
          const { allProducts } = get();
          return allProducts.filter((product) =>
            isInCategory(product, "apparel"),
          );
        },

        getHeadwearProducts: () => {
          const { allProducts } = get();
          return allProducts.filter((product) =>
            isInCategory(product, "headwear"),
          );
        },

        getAllCollectionsProducts: () => {
          const { allProducts } = get();
          return allProducts.filter((product) =>
            isInCategory(product, "all-collections"),
          );
        },
      }),
      {
        name: "product-store", // name of item in the storage (must be unique)
        partialize: (state) => ({
          categoryFilter: state.categoryFilter,
          priceRangeFilter: state.priceRangeFilter,
          stockStatusFilter: state.stockStatusFilter,
          colorFilters: state.colorFilters,
          sizeFilters: state.sizeFilters,
          // We don't persist currentProduct as it should be fetched fresh
        }),
      },
    ),
  ),
);

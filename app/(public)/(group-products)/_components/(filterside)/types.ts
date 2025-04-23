// app/(public)/(group-products)/_components/(filterside)/types.ts

// Variation Type
export interface Variation {
  id: string;
  name: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

// Base Product Type (for internal use)
export interface BaseProduct {
  id: string;
  productName: string;
  category: string[];
  productImgUrl: string;
  description: string;
  sellingPrice: number;
}

// Full Product Type (includes all fields)
export interface Product extends BaseProduct {
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Extended Product with Variations
export interface ProductWithVariations extends Product {
  variations: Variation[];
}

// Public Product Type (for public-facing data)
export interface PublicProduct extends BaseProduct {
  variations?: Variation[];
}

// Action Result Types
export interface ProductActionResult {
  success: boolean;
  error?: string;
  product?: ProductWithVariations;
  products?: ProductWithVariations[];
}

// Category Types - For better type safety when working with categories
export type ProductCategory =
  | "apparel"
  | "Apparel"
  | "APPAREL"
  | "headwear"
  | "Headwear"
  | "HEADWEAR"
  | "all-collections"
  | "All-Collections"
  | "ALL-COLLECTIONS"
  | string; // Allow for other custom categories

// Helper function to get case variations of a category
export function getCategoryVariations(category: string): string[] {
  return [
    category,
    category.toLowerCase(),
    category.toUpperCase(),
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
  ];
}

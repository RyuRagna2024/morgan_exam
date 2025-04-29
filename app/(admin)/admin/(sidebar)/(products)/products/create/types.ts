// Define allowed image types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
] as const;

export const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6mb

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

export interface Product {
  id: string;
  productName: string;
  category: string[];
  productImgUrl: string;
  description: string;
  sellingPrice: number;
  isPublished: boolean;
  isFeatured?: boolean; // Added isFeatured (optional here)
  variations?: Variation[];
}

export interface ProductActionResult {
  success: boolean;
  product?: Product;
  error?: string;
}

export interface VariationActionResult {
  success: boolean;
  variation?: Variation;
  error?: string;
}

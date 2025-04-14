// validations.ts
import { z } from "zod";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "./types";

// Validation for file uploads
const fileValidation = z
  .custom<File>()
  .refine((file) => file !== undefined, "Image is required")
  .refine(
    (file) => file instanceof File && file.size > 0,
    "Please select a valid file"
  )
  .refine(
    (file) =>
      file instanceof File && ALLOWED_IMAGE_TYPES.includes(file.type as any),
    "Invalid file type. Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF"
  )
  .refine(
    (file) => file instanceof File && file.size <= MAX_IMAGE_SIZE,
    "File size must be less than 6MB"
  );

// Schema for a single variation
export const variationSchema = z.object({
  name: z
    .string()
    .min(1, "Variation name is required")
    .max(50, "Variation name must be less than 50 characters"),
  color: z
    .string()
    .min(1, "Color is required")
    .max(30, "Color must be less than 30 characters"),
  size: z
    .string()
    .min(1, "Size is required")
    .max(20, "Size must be less than 20 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be less than 50 characters"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(99999, "Quantity must be less than 100,000"),
  price: z
    .number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price must be less than 1,000,000"),
  variationImage: fileValidation.optional(),
});

// Schema for the main product create form
export const createProductSchema = z.object({
  productImage: fileValidation,
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  category: z
    .array(z.string())
    .min(1, "At least one category is required")
    .max(5, "Maximum 5 categories allowed"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters"),
  sellingPrice: z
    .number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price must be less than 1,000,000"),
  isPublished: z.boolean().default(true),
  variations: z.array(variationSchema).optional(),
});

// Schema for adding variations to an existing product
export const addVariationSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variation: variationSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type VariationInput = z.infer<typeof variationSchema>;
export type AddVariationInput = z.infer<typeof addVariationSchema>;
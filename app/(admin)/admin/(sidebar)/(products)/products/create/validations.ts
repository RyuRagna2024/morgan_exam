import { z } from "zod";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "./types"; // Adjust path if needed

// Validation for file uploads (base, can be made optional)
const fileValidationBase = z
  .custom<File>()
  .refine((file) => file instanceof File, "Invalid file type expected.") // Ensure it's a File
  .refine(
    (file) => file.size > 0, // Check size after ensuring it's a File
    "Please select a valid file.",
  )
  .refine(
    (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
    `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}.`,
  )
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE,
    `File size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
  );

// Make file validation optional for editing schemas
const optionalFileValidation = fileValidationBase.nullable().optional();

// Schema for a single variation's data fields (excluding the image File object for reuse)
const variationBaseSchema = z.object({
  id: z.string().optional(), // ID is present only on existing variations during edit
  name: z
    .string()
    .min(1, "Variation name is required.")
    .max(50, "Variation name max 50 characters."),
  color: z
    .string()
    .min(1, "Color is required.")
    .max(30, "Color max 30 characters."),
  size: z
    .string()
    .min(1, "Size is required.")
    .max(20, "Size max 20 characters."),
  sku: z.string().min(1, "SKU is required.").max(50, "SKU max 50 characters."),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number." })
    .int("Quantity must be whole.")
    .min(0, "Quantity cannot be negative.")
    .max(99999, "Quantity max 99,999."),
  price: z
    .number({ invalid_type_error: "Price must be a number." })
    .min(0.01, "Price must be > 0.")
    .max(999999.99, "Price max 999,999.99."),
});

// Schema for a variation INCLUDING the image file (used in arrays)
export const variationSchema = variationBaseSchema.extend({
  variationImage: fileValidationBase.optional(), // Image is optional even for creation? Adjust if required.
  // If required on CREATE but not edit, use different schemas.
  // Let's keep it optional for now assuming create also allows submitting without image initially?
  // If required on create: use fileValidationBase here.
});

// Schema for the main product CREATE form
export const createProductSchema = z.object({
  productImage: fileValidationBase, // Required on create
  productName: z
    .string()
    .min(1, "Product name required.")
    .max(100, "Name max 100 chars."),
  category: z
    .array(z.string().min(1, "Category cannot be empty."))
    .min(1, "Min 1 category.")
    .max(5, "Max 5 categories."),
  description: z
    .string()
    .min(1, "Description required.")
    .max(1000, "Desc max 1000 chars."),
  sellingPrice: z
    .number({ invalid_type_error: "Base Price required." })
    .min(0.01, "Base Price > 0.")
    .max(999999.99, "Base Price max 999,999.99."),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false).optional(),
  variations: z.array(variationSchema).optional(), // Variations array uses schema with image
});

// Schema for the main product EDIT form
export const editProductSchema = createProductSchema.extend({
  productImage: optionalFileValidation, // Main image becomes optional on edit
  variations: z
    .array(
      variationBaseSchema.extend({
        // Use base variation schema...
        variationImage: optionalFileValidation, // ...and make its image optional too
      }),
    )
    .optional(),
});

// Export Types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type EditProductInput = z.infer<typeof editProductSchema>;
export type VariationInput = z.infer<typeof variationSchema>; // This includes optional image field

// Schema for adding a single variation (if needed separately)
export const addVariationSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variation: variationSchema, // Uses the variation schema with image
});
export type AddVariationInput = z.infer<typeof addVariationSchema>;

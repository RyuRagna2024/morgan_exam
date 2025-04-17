// app/(customer)/settings/types.ts
import * as z from "zod";

// --- Existing Personal Info Schema (Keep as is for the first tab) ---
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  displayName: z
    .string()
    .min(3, "Display name must be at least 3 characters")
    .max(50)
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .trim(),
  email: z.string().email("Please enter a valid email address").trim(),
  phoneNumber: z
    .string()
    .max(20, "Phone number seems too long")
    .optional()
    .or(z.literal("")), // Optional in personal info
  streetAddress: z
    .string()
    .min(1, "Street Address is required")
    .max(100)
    .trim(),
  suburb: z.string().max(100).trim().optional().or(z.literal("")),
  townCity: z.string().min(1, "Town/City is required").max(50).trim(),
  postcode: z.string().min(1, "Postcode is required").max(20).trim(),
  country: z.string().min(1, "Country is required").max(50).trim(),
});
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// --- NEW Schema for Checkout Details Tab (Uses existing User fields) ---
export const checkoutDetailsSchema = z.object({
  // Fields from User model relevant to checkout billing/shipping
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  // companyName: NOT ON USER MODEL
  country: z.string().min(1, "Country is required").max(50).trim(), // Maps to Order.countryRegion
  streetAddress: z
    .string()
    .min(1, "Street Address is required")
    .max(100)
    .trim(),
  suburb: z.string().max(100).trim().optional().or(z.literal("")), // Maps to Order.apartmentSuite
  townCity: z.string().min(1, "Town/City is required").max(50).trim(),
  // province: NOT ON USER MODEL
  postcode: z.string().min(1, "Postcode is required").max(20).trim(),
  phoneNumber: z.string().min(1, "Phone number is required").max(20).trim(), // Make required for checkout?
  email: z.string().email("Valid email address is required").trim(),
});

// Type derived from the checkout details schema
export type CheckoutDetailsFormValues = z.infer<typeof checkoutDetailsSchema>;

// app/(public)/checkout/order-validations.ts
import { z } from "zod";

/**
 * Validation schema for the ACTUAL order input data during checkout step 1.
 * Fields here are generally REQUIRED for placing the order, unlike preferences.
 */
export const orderValidationSchema = z.object({
  // Fields specific to the checkout process itself
  captivityBranch: z.string().min(1, "Branch selection is required"),
  methodOfCollection: z
    .string()
    .min(1, "Method of collection/delivery is required"),
  salesRep: z.string().optional(), // Optional
  referenceNumber: z.string().optional(), // Optional

  // Billing/Shipping details (Required for the order)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required"), // Required for B2B/Invoice? Adjust if not.
  countryRegion: z.string().min(1, "Country/Region is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apartmentSuite: z.string().optional(), // Optional
  townCity: z.string().min(1, "Town/City is required"),
  province: z.string().min(1, "Province is required"), // Required for shipping/tax? Adjust if not.
  postcode: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("A valid email address is required"),

  // Order notes & Consents
  orderNotes: z.string().optional(), // Optional
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions to place the order.",
  }),
  receiveEmailReviews: z.boolean().optional().default(false), // Optional, default to false
});

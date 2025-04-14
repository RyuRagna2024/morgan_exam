// Validation schemas for order-related operations
import { z } from "zod";

/**
 * Validation schema for order input data
 */
export const orderValidationSchema = z.object({
  captivityBranch: z.string().min(1, "Branch is required"),
  methodOfCollection: z.string().min(1, "Method of collection is required"),
  salesRep: z.string().optional(),
  referenceNumber: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required"),
  countryRegion: z.string().min(1, "Country/Region is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apartmentSuite: z.string().optional(),
  townCity: z.string().min(1, "Town/City is required"),
  province: z.string().min(1, "Province is required"),
  postcode: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  orderNotes: z.string().optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  receiveEmailReviews: z.boolean().optional(),
});

// app/(customer)/settings/types.ts
import * as z from "zod";

export const profileUpdateSchema = z.object({
  // Basic Info
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
    .or(z.literal("")),

  // --- Address fields MATCHING PRISMA ---
  streetAddress: z
    .string()
    .min(1, "Street Address is required")
    .max(100)
    .trim(), // Renamed from addressLine1
  suburb: z.string().max(100).trim().optional().or(z.literal("")), // Renamed from addressLine2, optional
  townCity: z.string().min(1, "Town/City is required").max(50).trim(), // Renamed from city
  // stateProvince: z.string().min(1, "State/Province is required").max(50).trim(), // REMOVED - Not in Prisma schema
  postcode: z.string().min(1, "Postcode is required").max(20).trim(), // Renamed from postalCode
  country: z.string().min(1, "Country is required").max(50).trim(), // Matches
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

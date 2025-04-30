// app/(customer)/settings/_actions/types.ts

import { z } from "zod";

// --- Profile Info Update Schema (Keep as is) ---
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
  country: z.string().min(1, "Country is required"), // User profile uses 'country'
  postcode: z.string().min(1, "Postcode is required"),
  streetAddress: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(),
  townCity: z.string().optional().nullable(),
});
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// --- <<< RENAMED & UPDATED: Checkout PREFERENCE Schema >>> ---
// Fields match UserCheckoutPreference model and are optional for saving preferences
export const checkoutPreferenceSchema = z.object({
  firstName: z.string().min(1, "First name is required").nullable().optional(), // Allow clearing preference by submitting empty string (becomes null)
  lastName: z.string().min(1, "Last name is required").nullable().optional(),
  companyName: z.string().nullable().optional(), // Optional string
  countryRegion: z
    .string()
    .min(1, "Country/Region is required")
    .nullable()
    .optional(), // Naming matches Order/Preference model
  streetAddress: z
    .string()
    .min(1, "Street address is required")
    .nullable()
    .optional(),
  apartmentSuite: z.string().nullable().optional(), // Optional string
  townCity: z.string().min(1, "Town/City is required").nullable().optional(),
  province: z.string().min(1, "Province is required").nullable().optional(),
  postcode: z.string().min(1, "Postal code is required").nullable().optional(),
  phone: z.string().min(1, "Phone number is required").nullable().optional(),
  email: z.string().email("Invalid email address").nullable().optional(),
});
// <<< RENAMED TYPE >>>
export type CheckoutPreferenceFormValues = z.infer<
  typeof checkoutPreferenceSchema
>;

// --- General Action Result Types (Keep as is) ---
export interface UpdateActionResult {
  success?: string | null;
  error?: string | null;
}
export interface ProfileUpdateActionResult extends UpdateActionResult {
  updatedUser?: Partial<ProfileUpdateFormValues>;
}

// --- Password Change Schema and Types (Keep as is) ---
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(255)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
export interface PasswordChangeResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof PasswordChangeFormValues, string>>;
}

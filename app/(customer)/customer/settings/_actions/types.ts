// app/(customer)/settings/_actions/types.ts

import { z } from "zod";

// --- Profile Info Update Schema ---
export const profileUpdateSchema = z.object({
  // Assuming these fields can be updated based on ProfileInfoForm
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(), // Allow empty string, null, or valid number
  country: z.string().min(1, "Country is required"),
  postcode: z.string().min(1, "Postcode is required"),
  // Add other fields from ProfileInfoForm if they exist
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// --- Checkout Details Update Schema ---
// Adjust fields based on CheckoutDetailsForm
export const checkoutDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().optional(), // Assuming optional
  country: z.string().min(1, "Country/Region is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apartmentSuite: z.string().optional(),
  townCity: z.string().min(1, "Town/City is required"),
  province: z.string().min(1, "Province is required"),
  postcode: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  // Add other fields from CheckoutDetailsForm if they exist
});

export type CheckoutDetailsFormValues = z.infer<typeof checkoutDetailsSchema>;

// --- General Action Result Type ---
// Can be used for profile and checkout updates
export interface UpdateActionResult {
  success?: string | null; // Success message
  error?: string | null; // Error message
}

// --- NEW: Password Change Schema and Type ---
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    // Using the same password complexity rules as registration for consistency
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(255, "Password cannot exceed 255 characters") // Match registration max length
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"], // Point the error to the confirmation field
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

// --- NEW: Password Change Server Action Result Type ---
export interface PasswordChangeResult {
  success: boolean; // Use boolean for success/failure status
  message?: string; // Message for success or general info
  error?: string; // General error message if success is false
  // Specific field errors, keys should match form values
  fieldErrors?: Partial<Record<keyof PasswordChangeFormValues, string>>;
}

// app/(customer)/settings/_actions/types.ts

import { z } from "zod";

// --- Profile Info Update Schema ---
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
  country: z.string().min(1, "Country is required"),
  postcode: z.string().min(1, "Postcode is required"),
  // --- ADD Missing Address Fields (make optional to match form usage) ---
  streetAddress: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(), // Represents Apt/Suite in this form
  townCity: z.string().optional().nullable(),
  // --- END ADD ---
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// --- Checkout Details Update Schema ---
export const checkoutDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().optional(),
  country: z.string().min(1, "Country/Region is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  // --- Use apartmentSuite and phone to match form ---
  apartmentSuite: z.string().optional(), // Use this name
  townCity: z.string().min(1, "Town/City is required"),
  province: z.string().min(1, "Province is required"), // Keep if needed by backend
  postcode: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone number is required"), // Use this name
  // --- End Use ---
  email: z.string().email("Invalid email address"),
});

export type CheckoutDetailsFormValues = z.infer<typeof checkoutDetailsSchema>;

// --- General Action Result Type ---
export interface UpdateActionResult {
  success?: string | null;
  error?: string | null;
}

// --- Password Change Schema and Type ---
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

// --- Password Change Server Action Result Type ---
export interface PasswordChangeResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof PasswordChangeFormValues, string>>;
}

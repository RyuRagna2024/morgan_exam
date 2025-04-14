import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password cannot exceed 255 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  remember: z.boolean().default(false).optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

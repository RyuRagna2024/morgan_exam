// src/lib/validations.ts
import { z } from "zod";

const MAX_ATTACHMENT_SIZE = 1024 * 1024 * 5; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Schema for the support request form data
export const supportRequestSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters." })
    .max(150, { message: "Subject must be 150 characters or less." }),
  name: z.string().min(2, { message: "Name is required." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(5000, { message: "Message must be 5000 characters or less." }),
  // Attachment is optional: must be a File, or null/undefined
  attachment: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_ATTACHMENT_SIZE,
      `Max image size is 5MB.`,
    )
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported.",
    )
    .optional() // Makes the attachment optional
    .or(z.literal(null)) // Allows null if no file is sent
    .or(z.literal(undefined)), // Allows undefined if no file is sent
});

// Type inferred from the schema
export type SupportRequestData = z.infer<typeof supportRequestSchema>;

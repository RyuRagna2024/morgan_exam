// app/(public)/_components/(section-1)/validations.ts

import { z } from "zod";

export const createSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bgColor: z.string().min(1, "Background color is required"),
  order: z.number().min(1, "Order must be at least 1"),
  sliderImage: z
    .any()
    .refine((file) => file instanceof File, "Image is required")
    .refine(
      (file) => file instanceof File && file.size <= 6 * 1024 * 1024,
      "Image must be less than 6MB",
    ),
});

export type CreateSlideInput = z.infer<typeof createSlideSchema>;

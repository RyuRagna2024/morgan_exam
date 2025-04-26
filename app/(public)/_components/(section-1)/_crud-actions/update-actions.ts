// app/(public)/_components/(section-1)/_crud-actions/update-actions.ts

"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type SlideResponse,
} from "../types";

// In action.ts
export async function updateSlide(formData: FormData): Promise<SlideResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/login");
    }

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const bgColor = formData.get("bgColor") as string;
    const order = parseInt(formData.get("order") as string);
    const file = formData.get("sliderImage") as File | null;

    let sliderImageurl: string | undefined;

    if (file && file.size) {
      // Validate image type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
        throw new Error(
          "Invalid file type. Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF",
        );
      }

      // Validate image size
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error("File size must be less than 6MB");
      }

      // Upload new image
      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `slides/slide_${user.id}_${timestamp}.${fileExt}`;

      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });

      if (!blob.url) throw new Error("Failed to get URL from blob storage");
      sliderImageurl = blob.url;
    }

    // Update slide in database
    const slide = await prisma.slide.update({
      where: { id },
      data: {
        title,
        description,
        bgColor,
        order,
        ...(sliderImageurl && { sliderImageurl }),
      },
    });

    return {
      success: true,
      data: slide,
    };
  } catch (error) {
    console.error("Error updating slide:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

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

export async function createSlide(formData: FormData): Promise<SlideResponse> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/login");
    }

    // Get form data
    const file = formData.get("sliderImage") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const bgColor = formData.get("bgColor") as string;
    const order = parseInt(formData.get("order") as string);

    // Validate inputs
    if (!file || !file.size) throw new Error("No file provided");
    if (!title || !description || !bgColor || !order) {
      throw new Error("All fields are required");
    }

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

    // Upload image to blob storage
    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `slides/slide_${user.id}_${timestamp}.${fileExt}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    if (!blob.url) throw new Error("Failed to get URL from blob storage");

    // Create slide in database
    const slide = await prisma.slide.create({
      data: {
        title,
        description,
        bgColor,
        order,
        sliderImageurl: blob.url,
        userId: user.id,
      },
    });

    return {
      success: true,
      data: slide,
    };
  } catch (error) {
    console.error("Error creating slide:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];
const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB

// Response types
interface NewArrivalResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface PaginatedResponse {
  success: boolean;
  data?: {
    items: any[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

// Delete action
export async function deleteNewArrival(
  id: string,
): Promise<NewArrivalResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/login");
    }

    const newArrival = await prisma.newArrival.delete({
      where: { id },
    });

    return {
      success: true,
      data: newArrival,
    };
  } catch (error) {
    console.error("Error deleting new arrival:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Update action
export async function updateNewArrival(
  id: string,
  formData: FormData,
): Promise<NewArrivalResponse> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/login");
    }

    // Get form data
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const rating = parseInt(formData.get("rating") as string);
    const file = formData.get("image") as File;

    // Validate basic inputs
    if (!name || !price || !rating) {
      throw new Error("Name, price, and rating are required");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    let imageUrl: string | undefined;

    // Handle image upload if a new file is provided
    if (file && file.size > 0) {
      // Validate image
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
        throw new Error(
          "Invalid file type. Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF",
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error("File size must be less than 6MB");
      }

      // Upload new image
      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `new-arrivals/product_${user.id}_${timestamp}.${fileExt}`;

      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });

      if (!blob.url) throw new Error("Failed to get URL from blob storage");
      imageUrl = blob.url;
    }

    // Update new arrival in database
    const updatedNewArrival = await prisma.newArrival.update({
      where: { id },
      data: {
        name,
        price,
        rating,
        ...(imageUrl && { imageUrl }), // Only update image if new one was uploaded
      },
    });

    return {
      success: true,
      data: updatedNewArrival,
    };
  } catch (error) {
    console.error("Error updating new arrival:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

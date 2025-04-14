"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";

// Constants for validation
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

// Create action
export async function createNewArrival(
  formData: FormData,
): Promise<NewArrivalResponse> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/");
    }

    // Get form data
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const rating = parseInt(formData.get("rating") as string);

    // Validate inputs
    if (!file || !file.size) throw new Error("No image file provided");
    if (!name || !price || !rating) {
      throw new Error("All fields are required");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (price <= 0) {
      throw new Error("Price must be greater than 0");
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
    const path = `new-arrivals/product_${user.id}_${timestamp}.${fileExt}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    if (!blob.url) throw new Error("Failed to get URL from blob storage");

    // Create new arrival in database
    const newArrival = await prisma.newArrival.create({
      data: {
        name,
        price,
        rating,
        imageUrl: blob.url,
        userId: user.id,
      },
    });

    return {
      success: true,
      data: newArrival,
    };
  } catch (error) {
    console.error("Error creating new arrival:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Get all new arrivals
export async function getNewArrivals(): Promise<NewArrivalResponse> {
  try {
    const items = await prisma.newArrival.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Get single new arrival by ID
export async function getNewArrivalById(
  id: string,
): Promise<NewArrivalResponse> {
  try {
    const newArrival = await prisma.newArrival.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    if (!newArrival) {
      throw new Error("New arrival not found");
    }

    return {
      success: true,
      data: newArrival,
    };
  } catch (error) {
    console.error("Error fetching new arrival:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

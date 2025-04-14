"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type ProductActionResult,
  type VariationActionResult,
} from "./types";

export async function createProduct(
  formData: FormData,
): Promise<ProductActionResult> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return {
        success: false,
        error: "You don't have permission to create products",
      };
    }

    // Get form data
    const file = formData.get("productImage") as File;
    const productName = formData.get("productName") as string;
    const category = formData.getAll("category") as string[];
    const description = formData.get("description") as string;
    const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
    const isPublished = formData.get("isPublished") === "true";

    // Validate inputs
    if (!file || !file.size) throw new Error("No file provided");
    if (!productName || !category.length || !description || !sellingPrice) {
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
    const path = `products/product_${user.id}_${timestamp}.${fileExt}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    if (!blob.url) throw new Error("Failed to get URL from blob storage");

    // Get variations data
    const variationsData = formData.get("variations");
    let processedVariations = [];

    if (variationsData) {
      try {
        const variations = JSON.parse(variationsData as string);

        // Process each variation
        for (let i = 0; i < variations.length; i++) {
          const variation = variations[i];

          // Get the variation image file from formData
          const variationImageFile = formData.get(
            `variationImage_${i}`,
          ) as File;

          if (!variationImageFile || !variationImageFile.size) {
            throw new Error(
              `Image is required for variation "${variation.name}"`,
            );
          }

          // Validate image type
          if (!ALLOWED_IMAGE_TYPES.includes(variationImageFile.type as any)) {
            throw new Error(
              `Invalid file type for variation "${variation.name}". Allowed types are JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF`,
            );
          }

          // Validate image size
          if (variationImageFile.size > MAX_IMAGE_SIZE) {
            throw new Error(
              `File size must be less than 6MB for variation "${variation.name}"`,
            );
          }

          // Upload the variation image
          const varFileExt = variationImageFile.name.split(".").pop() || "jpg";
          const varPath = `products/variation_${user.id}_${timestamp}_${i}_${variation.name.replace(/\s+/g, "_")}.${varFileExt}`;

          const varBlob = await put(varPath, variationImageFile, {
            access: "public",
            addRandomSuffix: false,
          });

          if (!varBlob.url)
            throw new Error(
              `Failed to upload image for variation "${variation.name}"`,
            );

          // Add the processed variation to the array
          processedVariations.push({
            name: variation.name,
            color: variation.color,
            size: variation.size,
            sku: variation.sku,
            quantity: parseInt(variation.quantity.toString()),
            price: parseFloat(variation.price.toString()),
            imageUrl: varBlob.url, // This is crucial - ensure imageUrl is set
          });
        }
      } catch (error) {
        console.error("Error processing variations:", error);
        throw error;
      }
    }

    // Create product in database with variations
    const product = await prisma.product.create({
      data: {
        productName,
        category,
        productImgUrl: blob.url,
        description,
        sellingPrice,
        isPublished,
        userId: user.id,
        Variation: {
          create: processedVariations,
        },
      },
      include: {
        Variation: true,
      },
    });

    return {
      success: true,
      product: {
        id: product.id,
        productName: product.productName,
        category: product.category,
        productImgUrl: product.productImgUrl,
        description: product.description,
        sellingPrice: product.sellingPrice,
        isPublished: product.isPublished,
        variations: product.Variation.map((v) => ({
          id: v.id,
          name: v.name,
          color: v.color,
          size: v.size,
          sku: v.sku,
          quantity: v.quantity,
          price: v.price,
          imageUrl: v.imageUrl,
        })),
      },
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function addVariation(
  formData: FormData,
): Promise<VariationActionResult> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return {
        success: false,
        error: "You don't have permission to add variations",
      };
    }

    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;
    const size = formData.get("size") as string;
    const sku = formData.get("sku") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const price = parseFloat(formData.get("price") as string);
    const file = formData.get("variationImage") as File;

    // Validate required fields
    if (
      !productId ||
      !name ||
      !color ||
      !size ||
      !sku ||
      isNaN(quantity) ||
      isNaN(price)
    ) {
      throw new Error("All fields are required");
    }

    // Check if product exists and belongs to the user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: user.id,
      },
    });

    if (!product) {
      throw new Error(
        "Product not found or you don't have permission to modify it",
      );
    }

    let imageUrl = "";

    // Upload image if provided
    if (file && file.size > 0) {
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

      const fileExt = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const path = `products/variation_${user.id}_${timestamp}_${name.replace(/\s+/g, "_")}.${fileExt}`;

      const blob = await put(path, file, {
        access: "public",
        addRandomSuffix: false,
      });

      if (!blob.url) throw new Error("Failed to get URL from blob storage");
      imageUrl = blob.url;
    } else {
      throw new Error("Variation image is required");
    }

    // Create the variation
    const variation = await prisma.variation.create({
      data: {
        name,
        color,
        size,
        sku,
        quantity,
        price,
        imageUrl,
        productId,
      },
    });

    return {
      success: true,
      variation: {
        id: variation.id,
        name: variation.name,
        color: variation.color,
        size: variation.size,
        sku: variation.sku,
        quantity: variation.quantity,
        price: variation.price,
        imageUrl: variation.imageUrl,
      },
    };
  } catch (error) {
    console.error("Error adding variation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

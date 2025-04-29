// app/(admin)/admin/products/_actions/actions.ts
"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob"; // Ensure 'del' is imported
import prisma from "@/lib/prisma";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type Product, // Use the admin Product type
  type Variation, // Import Variation type if needed for mapping
  type ProductActionResult,
  type VariationActionResult,
} from "./types"; // Ensure types are correctly defined and exported

// Interface specifically for the list result
interface ProductListResult {
  success: boolean;
  products?: Product[]; // Use the Product type from types.ts
  error?: string;
}

// Interface for the delete result
interface DeleteResult {
  success: boolean;
  message?: string;
  error?: string;
}

// --- createProduct FUNCTION ---
export async function createProduct(
  formData: FormData,
): Promise<ProductActionResult> {
  try {
    // 1. Validate user session and role
    const { user } = await validateRequest();
    if (!user) {
      return { success: false, error: "Unauthorized: Not logged in" };
    }
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return { success: false, error: "Forbidden: Insufficient permissions" };
    }

    // 2. Extract and Validate Basic Product Data from FormData
    const productName = formData.get("productName") as string;
    const description = formData.get("description") as string;
    const sellingPriceString = formData.get("sellingPrice") as string;
    const isPublished = formData.get("isPublished") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const categoryValue = formData.getAll("category");

    if (
      !productName ||
      !description ||
      !sellingPriceString ||
      !categoryValue ||
      categoryValue.length === 0
    ) {
      return { success: false, error: "Missing required product information." };
    }
    const sellingPrice = parseFloat(sellingPriceString);
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      return { success: false, error: "Invalid Base Price provided." };
    }
    const categories = categoryValue
      .map((cat) => (typeof cat === "string" ? cat.trim() : ""))
      .filter(Boolean);
    if (categories.length === 0) {
      return {
        success: false,
        error: "At least one valid category is required.",
      };
    }
    if (categories.length > 5) {
      return { success: false, error: "Maximum 5 categories allowed." };
    }

    // 3. Validate and Prepare Product Image
    const file = formData.get("productImage") as File;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "Product image file is required." };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return {
        success: false,
        error: `Invalid product image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: `Product image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
      };
    }

    // 4. Prepare Variation Data (if present)
    const variationsDataString = formData.get("variations") as string | null;
    let variationsToCreate = [];
    const variationFiles: { [key: string]: File } = {};

    if (variationsDataString) {
      try {
        const variationsInput = JSON.parse(variationsDataString);
        if (!Array.isArray(variationsInput)) {
          throw new Error("Variations data is not a valid array.");
        }

        for (let i = 0; i < variationsInput.length; i++) {
          const vInput = variationsInput[i];
          const variationImageFile = formData.get(
            `variationImage_${i}`,
          ) as File;
          if (
            !vInput.name ||
            !vInput.color ||
            !vInput.size ||
            !vInput.sku ||
            vInput.quantity == null ||
            vInput.price == null
          ) {
            return {
              success: false,
              error: `Missing required fields for variation ${i + 1}.`,
            };
          }
          const quantity = parseInt(vInput.quantity.toString());
          const price = parseFloat(vInput.price.toString());
          if (isNaN(quantity) || quantity < 0 || isNaN(price) || price <= 0) {
            return {
              success: false,
              error: `Invalid quantity or price for variation ${i + 1}.`,
            };
          }
          if (
            !variationImageFile ||
            !(variationImageFile instanceof File) ||
            variationImageFile.size === 0
          ) {
            return {
              success: false,
              error: `Image file is required for variation ${i + 1} (${vInput.name}).`,
            };
          }
          if (!ALLOWED_IMAGE_TYPES.includes(variationImageFile.type as any)) {
            return {
              success: false,
              error: `Invalid image type for variation ${i + 1}.`,
            };
          }
          if (variationImageFile.size > MAX_IMAGE_SIZE) {
            return {
              success: false,
              error: `Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB for variation ${i + 1}.`,
            };
          }

          const variationImageKey = `variation_${i}`;
          variationFiles[variationImageKey] = variationImageFile;
          variationsToCreate.push({
            name: vInput.name,
            color: vInput.color,
            size: vInput.size,
            sku: vInput.sku,
            quantity: quantity,
            price: price,
          });
        }
      } catch (error) {
        console.error("Error processing variations JSON:", error);
        return { success: false, error: "Invalid variations data format." };
      }
    }

    // 5. Upload Product Image
    const timestamp = Date.now();
    const productFileExt = file.name.split(".").pop() || "jpg";
    const productPath = `products/product_${user.id}_${timestamp}.${productFileExt}`;
    let productBlobUrl = "";
    try {
      const blob = await put(productPath, file, {
        access: "public",
        addRandomSuffix: false,
      });
      if (!blob.url)
        throw new Error("Blob storage did not return a URL for product image.");
      productBlobUrl = blob.url;
    } catch (uploadError) {
      console.error("Error uploading product image:", uploadError);
      return { success: false, error: "Failed to upload product image." };
    }

    // 6. Upload Variation Images
    const variationImageUrls: { [key: number]: string } = {};
    try {
      for (let i = 0; i < variationsToCreate.length; i++) {
        const variationImageKey = `variation_${i}`;
        const varFile = variationFiles[variationImageKey];
        const varName = variationsToCreate[i].name.replace(/\s+/g, "_");
        const varFileExt = varFile.name.split(".").pop() || "jpg";
        const varPath = `products/variation_${user.id}_${timestamp}_${i}_${varName}.${varFileExt}`;
        const varBlob = await put(varPath, varFile, {
          access: "public",
          addRandomSuffix: false,
        });
        if (!varBlob.url)
          throw new Error(`Failed to upload image for variation ${i + 1}`);
        variationImageUrls[i] = varBlob.url;
      }
    } catch (uploadError) {
      console.error("Error uploading variation image(s):", uploadError);
      return {
        success: false,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload one or more variation images.",
      };
    }

    // 7. Create Product and Variations in Database
    try {
      const product = await prisma.product.create({
        data: {
          productName,
          category: categories,
          productImgUrl: productBlobUrl,
          description,
          sellingPrice,
          isPublished,
          isFeatured,
          userId: user.id,
          Variation: {
            create: variationsToCreate.map((vData, index) => ({
              ...vData,
              imageUrl: variationImageUrls[index],
            })),
          },
        },
        include: { Variation: true },
      });

      // 8. Return Success Response
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
          isFeatured: product.isFeatured,
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
    } catch (dbError) {
      console.error("Database error creating product:", dbError);
      return { success: false, error: "Failed to save product to database." };
    }
  } catch (error) {
    console.error("Unexpected error in createProduct action:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected server error occurred",
    };
  }
}

// --- addVariation FUNCTION (Can be removed if not used elsewhere) ---
export async function addVariation(
  formData: FormData,
): Promise<VariationActionResult> {
  console.warn(
    "addVariation action called but might be deprecated if using full form submit",
  );
  return {
    success: false,
    error:
      "Adding single variations separately is not fully implemented in this flow.",
  };
}

// --- Get Product List for Admin ---
export async function getAdminProductList(options?: {
  take?: number;
  skip?: number;
}): Promise<ProductListResult> {
  try {
    const { user } = await validateRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

    const products = await prisma.product.findMany({
      take: options?.take ?? 50,
      skip: options?.skip ?? 0,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        productName: true,
        productImgUrl: true,
        category: true,
        sellingPrice: true,
        isPublished: true,
        isFeatured: true,
        updatedAt: true,
        _count: {
          select: { Variation: true },
        },
      },
    });

    // Map to include variationCount, ensure it matches Product type or cast
    const formattedProducts = products.map((p) => ({
      id: p.id,
      productName: p.productName,
      category: p.category,
      productImgUrl: p.productImgUrl,
      description: "", // Add empty description as Product type might require it
      sellingPrice: p.sellingPrice,
      isPublished: p.isPublished,
      isFeatured: p.isFeatured,
      variationCount: p._count.Variation, // Add variationCount
      updatedAt: p.updatedAt, // Keep updatedAt
      // Omit variations array if base Product type doesn't include it for lists
    }));

    // Cast or adjust type as needed. This assumes your imported Product type
    // might not perfectly match the list structure (e.g., missing description, has variationCount)
    // Consider creating a dedicated type e.g., ProductListItem if needed.
    return { success: true, products: formattedProducts as Product[] };
  } catch (error) {
    console.error("Error fetching admin product list:", error);
    return { success: false, error: "Failed to fetch product list." };
  }
}

// --- NEW: Get Single Product for Admin Edit ---
export async function getAdminProductById(
  productId: string,
): Promise<ProductActionResult> {
  if (!productId) {
    return { success: false, error: "Product ID is required." };
  }
  try {
    const { user } = await validateRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

    // Fetch the product WITH its variations
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        // Potentially filter by userId if admins should only edit their own?
        // userId: user.id
      },
      include: {
        Variation: true, // <<< Crucial: Include variations
      },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    // Map to the Product type used by your admin form/types
    // Ensure this mapping matches the 'Product' interface in types.ts exactly
    const formattedProduct: Product = {
      id: product.id,
      productName: product.productName,
      category: product.category,
      productImgUrl: product.productImgUrl,
      description: product.description,
      sellingPrice: product.sellingPrice,
      isPublished: product.isPublished,
      isFeatured: product.isFeatured, // Include isFeatured
      variations: product.Variation.map(
        (v): Variation => ({
          // Explicit return type for map
          id: v.id,
          name: v.name,
          color: v.color,
          size: v.size,
          sku: v.sku,
          quantity: v.quantity,
          price: v.price,
          imageUrl: v.imageUrl,
        }),
      ),
      // Add other fields if your Product type requires them (e.g., createdAt, updatedAt)
    };

    return { success: true, product: formattedProduct };
  } catch (error) {
    console.error(`Error fetching product ${productId} for admin:`, error);
    return { success: false, error: "Failed to fetch product details." };
  }
}

// --- Delete Product FUNCTION ---
export async function deleteProduct(productId: string): Promise<DeleteResult> {
  if (!productId) {
    return { success: false, error: "Product ID is required." };
  }

  try {
    // 1. Validate user
    const { user } = await validateRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Find product and its variation image URLs BEFORE deleting from DB
    const productToDelete = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        productImgUrl: true,
        Variation: { select: { imageUrl: true } },
      },
    });

    if (!productToDelete) {
      return { success: false, error: "Product not found." };
    }

    // 3. Delete product from Database (related variations, cart items, etc., should cascade delete based on schema relations)
    await prisma.product.delete({
      where: { id: productId },
    });

    // 4. Delete images from Vercel Blob Storage (Best effort)
    const urlsToDelete: string[] = [];
    if (productToDelete.productImgUrl) {
      urlsToDelete.push(productToDelete.productImgUrl);
    }
    productToDelete.Variation.forEach((v) => {
      if (v.imageUrl) {
        urlsToDelete.push(v.imageUrl);
      }
    });

    if (urlsToDelete.length > 0) {
      try {
        await del(urlsToDelete);
      } catch (blobError) {
        console.error(
          `Failed to delete some blobs for product ${productId}:`,
          blobError,
        );
      }
    }

    return { success: true, message: "Product deleted successfully." };
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    if (error instanceof Error && (error as any).code === "P2025") {
      // Prisma code for record not found
      return { success: false, error: "Product not found." };
    }
    return {
      success: false,
      error: "Failed to delete product due to a server error.",
    };
  }
}

// --- updateProduct FUNCTION (Placeholder - Needs Implementation) ---
export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<ProductActionResult> {
  console.warn(
    `updateProduct action called for ${productId} - NOT IMPLEMENTED YET`,
  );
  // TODO: Implement full update logic:
  // 1. Validate user/permissions
  // 2. Fetch existing product data
  // 3. Validate incoming formData (similar to create, but images are optional)
  // 4. Handle main image update (upload new, delete old if replaced)
  // 5. Handle variation updates:
  //    - Identify new variations (no existing ID) -> Create them (upload images)
  //    - Identify updated variations (have existing ID) -> Update them (handle image replacement/deletion)
  //    - Identify deleted variations (present in DB but not in formData) -> Delete them (delete images)
  // 6. Use prisma.product.update() with nested variation logic (upsert, updateMany, deleteMany)
  // 7. Handle blob deletions carefully
  // 8. Return result

  return { success: false, error: "Update functionality not yet implemented." };
}

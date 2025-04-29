// app/(admin)/admin/products/_actions/actions.ts
"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import prisma from "@/lib/prisma";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type Product,
  type Variation,
  type ProductActionResult,
  type VariationActionResult,
} from "./types"; // Adjust path if necessary
// Type imports from Prisma Client for transaction safety
import { Prisma } from "@prisma/client";

// Interface specifically for the list result
interface ProductListResult {
  success: boolean;
  products?: Product[];
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
          /* ... map product data ... */
        } as Product,
      }; // Ensure return matches Product type
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

// --- addVariation FUNCTION (Can likely be removed if not used) ---
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
        _count: { select: { Variation: true } },
      },
    });

    const formattedProducts = products.map((p) => ({
      id: p.id,
      productName: p.productName,
      category: p.category,
      productImgUrl: p.productImgUrl,
      description: "",
      sellingPrice: p.sellingPrice,
      isPublished: p.isPublished,
      isFeatured: p.isFeatured,
      variationCount: p._count.Variation,
      updatedAt: p.updatedAt,
      variations: [], // Ensure variations array exists if needed by type Product
    }));

    return { success: true, products: formattedProducts as Product[] };
  } catch (error) {
    console.error("Error fetching admin product list:", error);
    return { success: false, error: "Failed to fetch product list." };
  }
}

// --- Get Single Product for Admin Edit ---
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { Variation: true },
    });
    if (!product) {
      return { success: false, error: "Product not found." };
    }

    const formattedProduct: Product = {
      id: product.id,
      productName: product.productName,
      category: product.category,
      productImgUrl: product.productImgUrl,
      description: product.description,
      sellingPrice: product.sellingPrice,
      isPublished: product.isPublished,
      isFeatured: product.isFeatured,
      variations: product.Variation.map(
        (v): Variation => ({
          /* ... map variation fields ... */ id: v.id,
          name: v.name,
          color: v.color,
          size: v.size,
          sku: v.sku,
          quantity: v.quantity,
          price: v.price,
          imageUrl: v.imageUrl,
        }),
      ),
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
    const { user } = await validateRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

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

    await prisma.product.delete({ where: { id: productId } }); // Cascade delete variations

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
        console.error(`Blob delete error for ${productId}:`, blobError);
      }
    }
    return { success: true, message: "Product deleted successfully." };
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    if (error instanceof Error && (error as any).code === "P2025") {
      return { success: false, error: "Product not found." };
    }
    return { success: false, error: "Failed to delete product." };
  }
}

// --- **** IMPLEMENTED updateProduct FUNCTION **** ---
export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<ProductActionResult> {
  if (!productId) {
    return { success: false, error: "Product ID is missing." };
  }

  try {
    // 1. Validate user session and role
    const { user } = await validateRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return {
        success: false,
        error: "Unauthorized: Insufficient permissions",
      };
    }

    // 2. Fetch Existing Product Data
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { Variation: true },
    });
    if (!existingProduct) {
      return { success: false, error: "Product not found." };
    }

    // 3. Extract & Validate Basic Product Data
    const productName = formData.get("productName") as string;
    const description = formData.get("description") as string;
    const sellingPriceString = formData.get("sellingPrice") as string;
    const isPublished = formData.get("isPublished") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const categoryValue = formData.getAll("category");
    // ... (add validation checks as in createProduct) ...
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
    if (categories.length === 0 || categories.length > 5) {
      return { success: false, error: "Invalid categories (1-5 required)." };
    }

    // 4. Handle NEW Product Image Upload
    let newProductImageUrl: string | undefined = undefined;
    const oldImageUrlsToDelete: string[] = [];
    const newProductImageFile = formData.get("newProductImage") as File | null;
    if (newProductImageFile && newProductImageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(newProductImageFile.type as any))
        return { success: false, error: "Invalid product image type." };
      if (newProductImageFile.size > MAX_IMAGE_SIZE)
        return { success: false, error: "Product image too large." };

      const timestamp = Date.now();
      const productFileExt = newProductImageFile.name.split(".").pop() || "jpg";
      const productPath = `products/product_${user.id}_${timestamp}_${productId}.${productFileExt}`;
      try {
        const blob = await put(productPath, newProductImageFile, {
          access: "public",
          addRandomSuffix: false,
        });
        if (!blob.url) throw new Error("Product image upload failed (no URL).");
        newProductImageUrl = blob.url;
        if (existingProduct.productImgUrl) {
          oldImageUrlsToDelete.push(existingProduct.productImgUrl);
        }
      } catch (uploadError) {
        console.error("Error uploading new product image:", uploadError);
        return { success: false, error: "Failed to upload new product image." };
      }
    }

    // 5. Process Variations
    const variationsDataString = formData.get("variations") as string | null;
    let incomingVariations: Array<Partial<Variation> & { id?: string }> = [];
    if (variationsDataString) {
      try {
        incomingVariations = JSON.parse(variationsDataString);
        if (!Array.isArray(incomingVariations)) throw new Error();
      } catch {
        return { success: false, error: "Invalid variations data format." };
      }
    }

    const variationUpdatePromises: Prisma.PrismaPromise<any>[] = [];
    const prismaVariationCreates: Prisma.VariationCreateManyInput[] = [];
    const variationIdsToDelete: string[] = [];
    const newVariationImageUrls: { [index: number]: string } = {};

    // Upload NEW variation images first
    try {
      for (let i = 0; i < incomingVariations.length; i++) {
        const newVarImageFile = formData.get(
          `newVariationImage_${i}`,
        ) as File | null;
        if (newVarImageFile && newVarImageFile.size > 0) {
          if (!ALLOWED_IMAGE_TYPES.includes(newVarImageFile.type as any))
            throw new Error(`Invalid image type for variation ${i + 1}.`);
          if (newVarImageFile.size > MAX_IMAGE_SIZE)
            throw new Error(`Image too large for variation ${i + 1}.`);
          const timestamp = Date.now();
          const varName =
            incomingVariations[i]?.name?.replace(/\s+/g, "_") || `var${i}`;
          const varFileExt = newVarImageFile.name.split(".").pop() || "jpg";
          const varPath = `products/${productId}/variation_${user.id}_${timestamp}_${i}_${varName}.${varFileExt}`;
          const varBlob = await put(varPath, newVarImageFile, {
            access: "public",
            addRandomSuffix: false,
          });
          if (!varBlob.url)
            throw new Error(`Failed to upload image for variation ${i + 1}`);
          newVariationImageUrls[i] = varBlob.url;
        }
      }
    } catch (uploadError) {
      console.error("Error uploading new variation image(s):", uploadError);
      return {
        success: false,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload one or more new variation images.",
      };
    }

    // Prepare Prisma operations
    const existingVariationIds = new Set(
      existingProduct.Variation.map((v) => v.id),
    );
    const incomingVariationIds = new Set(
      incomingVariations.filter((v) => v.id).map((v) => v.id!),
    );

    for (let i = 0; i < incomingVariations.length; i++) {
      const vData = incomingVariations[i];
      // Validate variation data
      if (
        !vData.name ||
        !vData.color ||
        !vData.size ||
        !vData.sku ||
        vData.quantity == null ||
        vData.price == null
      ) {
        return {
          success: false,
          error: `Missing required fields for variation ${i + 1}.`,
        };
      }
      const quantity = parseInt(vData.quantity.toString());
      const price = parseFloat(vData.price.toString());
      if (isNaN(quantity) || quantity < 0 || isNaN(price) || price <= 0) {
        return {
          success: false,
          error: `Invalid quantity or price for variation ${i + 1}.`,
        };
      }

      const variationPayload = {
        name: vData.name,
        color: vData.color,
        size: vData.size,
        sku: vData.sku,
        quantity: quantity,
        price: price,
        ...(newVariationImageUrls[i] && { imageUrl: newVariationImageUrls[i] }),
      };

      if (vData.id && existingVariationIds.has(vData.id)) {
        // Update
        variationUpdatePromises.push(
          prisma.variation.update({
            where: { id: vData.id },
            data: variationPayload,
          }),
        );
        if (newVariationImageUrls[i]) {
          const oldUrl = existingProduct.Variation.find(
            (ev) => ev.id === vData.id,
          )?.imageUrl;
          if (oldUrl) {
            oldImageUrlsToDelete.push(oldUrl);
          }
        }
      } else {
        // Create
        if (!newVariationImageUrls[i]) {
          return {
            success: false,
            error: `Missing new image for new variation ${i + 1} (${vData.name}).`,
          };
        }
        prismaVariationCreates.push({
          ...variationPayload,
          imageUrl: newVariationImageUrls[i],
          productId: productId,
        });
      }
    }
    existingProduct.Variation.forEach((existingVar) => {
      // Delete
      if (!incomingVariationIds.has(existingVar.id)) {
        variationIdsToDelete.push(existingVar.id);
        if (existingVar.imageUrl) {
          oldImageUrlsToDelete.push(existingVar.imageUrl);
        }
      }
    });

    // 6. Execute Database Updates in a Transaction
    try {
      const transactionOperations: Prisma.PrismaPromise<any>[] = [];

      // Update Product
      transactionOperations.push(
        prisma.product.update({
          where: { id: productId },
          data: {
            productName,
            description,
            sellingPrice,
            isPublished,
            isFeatured,
            category: categories,
            ...(newProductImageUrl && { productImgUrl: newProductImageUrl }),
          },
        }),
      );
      // Delete Variations
      if (variationIdsToDelete.length > 0) {
        transactionOperations.push(
          prisma.variation.deleteMany({
            where: { id: { in: variationIdsToDelete } },
          }),
        );
      }
      // Create Variations
      if (prismaVariationCreates.length > 0) {
        transactionOperations.push(
          prisma.variation.createMany({
            data: prismaVariationCreates,
            skipDuplicates: true,
          }),
        );
      }
      // Add individual update promises
      transactionOperations.push(...variationUpdatePromises);

      await prisma.$transaction(transactionOperations);

      // 7. Delete Old Images from Blob Storage
      if (oldImageUrlsToDelete.length > 0) {
        try {
          await del(oldImageUrlsToDelete);
        } catch (blobError) {
          console.error(
            `Blob delete error during update ${productId}:`,
            blobError,
          );
        }
      }

      // 8. Return updated product
      const updatedProductResult = await getAdminProductById(productId);
      if (!updatedProductResult.success || !updatedProductResult.product) {
        throw new Error(
          "Failed to refetch updated product data after successful update.",
        );
      }
      return { success: true, product: updatedProductResult.product };
    } catch (dbError) {
      console.error(`Database error updating product ${productId}:`, dbError);
      return { success: false, error: "Failed to update product in database." };
    }
  } catch (error) {
    console.error(
      `Unexpected error in updateProduct action for ${productId}:`,
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected server error occurred",
    };
  }
}

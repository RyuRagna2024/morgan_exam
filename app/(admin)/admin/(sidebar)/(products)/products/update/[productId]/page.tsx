// app/(admin)/admin/products/update/[productId]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { getAdminProductById } from "@/app/(admin)/admin/(sidebar)/(products)/products/create/actions"; // Adjust path
// Import the form component you want to reuse/adapt
// Option A: Reuse CreateProductForm (will need modification)
// import { CreateProductForm } from '../../create/ProductForm';
// Option B: Create a dedicated EditProductForm (recommended for clarity)
import EditProductForm from "@/app/(admin)/admin/(sidebar)/(products)/products/update/[productId]/_components/EditProductForm"; // We'll need to create this

interface EditProductPageProps {
  params: {
    productId?: string;
  };
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const productId = params.productId;

  if (!productId) {
    // Should ideally not happen with correct routing setup
    console.error("Product ID missing in edit page params");
    notFound(); // Or redirect to update list
  }

  // Fetch the product data
  const result = await getAdminProductById(productId);

  if (!result.success || !result.product) {
    // Handle case where product isn't found or fetch fails
    console.error(`Failed to fetch product ${productId}:`, result.error);
    // You could show an error message or redirect
    notFound(); // Simplest for now
  }

  const productToEdit = result.product;

  return (
    <div className="flex-1 w-full h-full">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update details for:{" "}
            <span className="font-medium">{productToEdit.productName}</span>
          </p>
        </div>
        {/* Pass the fetched product data to the form component */}
        <EditProductForm product={productToEdit} />
        {/* Or if reusing: <CreateProductForm productToEdit={productToEdit} /> */}
      </div>
    </div>
  );
}

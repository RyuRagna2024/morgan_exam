"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProduct } from "@/app/(admin)/admin/(sidebar)/(products)/products/create/actions"; // Import update action
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  createProductSchema,
  variationSchema,
} from "@/app/(admin)/admin/(sidebar)/(products)/products/create/validations"; // Import base schemas
import {
  ALLOWED_IMAGE_TYPES,
  Product,
  Variation,
} from "@/app/(admin)/admin/(sidebar)/(products)/products/create/types"; // Import types
// Import the REUSABLE tab components
import { ProductBasicInfoTab } from "../../../create/_components/ProductBasicInfoTab"; // Use the adapted create tab
import { ProductVariationsTab } from "../../../create/_components/ProductVariationsTab"; // Use the adapted create tab
import { z } from "zod";
import { useRouter } from "next/navigation";

// Define Edit Schema making images optional
const editProductSchema = createProductSchema.extend({
  productImage: z.custom<File>().nullable().optional(), // Make optional File | null | undefined
  variations: z
    .array(
      variationSchema.extend({
        id: z.string().optional(), // Add optional ID for existing variations
        variationImage: z.custom<File>().nullable().optional(), // Make optional File | null | undefined
      }),
    )
    .optional(),
});
type EditProductInput = z.infer<typeof editProductSchema>;

interface EditProductFormProps {
  product: Product; // Accept the full product data including variations
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Initialize displayPrice from product's sellingPrice
  const [displayPrice, setDisplayPrice] = useState(
    product.sellingPrice?.toFixed(2) || "0.00",
  );
  const [activeTab, setActiveTab] = useState("basic-info");
  // State to hold ONLY NEW files selected by the user
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newVariationImages, setNewVariationImages] = useState<{
    [key: number]: File | null;
  }>({});

  const form = useForm<EditProductInput>({
    resolver: zodResolver(editProductSchema),
    // Set default values from the fetched product data
    defaultValues: {
      productName: product.productName || "",
      category: product.category || [],
      description: product.description || "",
      sellingPrice: product.sellingPrice || 0,
      isPublished: product.isPublished ?? true,
      isFeatured: product.isFeatured ?? false,
      // Map existing variations, include ID, omit image File object initially
      variations:
        product.variations?.map((v) => ({
          id: v.id, // Important: include existing ID
          name: v.name || "",
          color: v.color || "",
          size: v.size || "",
          sku: v.sku || "",
          quantity: v.quantity ?? 0,
          price: v.price || 0,
          // variationImage: undefined, // Don't default File inputs
        })) || [], // Start with empty array if no variations exist
      // productImage: undefined, // Don't default File inputs
    },
  });

  // Field array setup
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  // Reset form if product prop changes
  useEffect(() => {
    form.reset({
      productName: product.productName || "",
      category: product.category || [],
      description: product.description || "",
      sellingPrice: product.sellingPrice || 0,
      isPublished: product.isPublished ?? true,
      isFeatured: product.isFeatured ?? false,
      variations:
        product.variations?.map((v) => ({
          id: v.id,
          name: v.name || "",
          color: v.color || "",
          size: v.size || "",
          sku: v.sku || "",
          quantity: v.quantity ?? 0,
          price: v.price || 0,
        })) || [],
    });
    setDisplayPrice(product.sellingPrice?.toFixed(2) || "0.00");
    setNewProductImage(null);
    setNewVariationImages({});
  }, [product, form]);

  // Currency formatter
  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) return parts[0] + "." + parts[1];
    return numericValue;
  };

  // Handlers for NEW image selections
  const handleProductImageChange = (files: FileList | null) => {
    setNewProductImage(files?.[0] || null);
    // Don't need form.setValue here, handle via external state `newProductImage`
  };

  const handleVariationImageChange = (
    index: number,
    files: FileList | null,
  ) => {
    setNewVariationImages((prev) => ({
      ...prev,
      [index]: files?.[0] || null,
    }));
    // Don't need form.setValue here
  };

  // Submit Handler
  async function onSubmit(data: EditProductInput) {
    setLoading(true);
    const formData = new FormData();

    // Append basic info
    formData.append("productName", data.productName);
    data.category.forEach((cat) => formData.append("category", cat));
    formData.append("description", data.description);
    formData.append("sellingPrice", data.sellingPrice.toString());
    formData.append("isPublished", data.isPublished.toString());
    formData.append("isFeatured", data.isFeatured?.toString() ?? "false");

    // Append NEW product image if user selected one
    if (newProductImage) {
      formData.append("newProductImage", newProductImage);
    }

    // Append variation data (crucially including IDs)
    if (data.variations && data.variations.length > 0) {
      formData.append("variations", JSON.stringify(data.variations));

      // Append NEW variation images using the correct index from the submitted data array
      data.variations.forEach((variation, index) => {
        const newFile = newVariationImages[index]; // Check the state using the loop index
        if (newFile) {
          formData.append(`newVariationImage_${index}`, newFile);
        }
      });
    } else {
      formData.append("variations", JSON.stringify([])); // Send empty array if all deleted
    }

    try {
      const result = await updateProduct(product.id, formData); // Pass product ID

      if (!result.success) {
        throw new Error(result.error || "Update failed");
      }

      toast.success("Product updated successfully!");
      router.push("/admin/products/update"); // Navigate back to list
      router.refresh(); // Refresh list page data
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update product",
      );
    } finally {
      setLoading(false);
    }
  }

  // Tab Navigation
  const goToNextTab = () => {
    if (activeTab === "basic-info") setActiveTab("variations");
  };
  const goToPreviousTab = () => {
    if (activeTab === "variations") setActiveTab("basic-info");
  };
  const validateBasicInfoAndProceed = async () => {
    const basicInfoFields: (keyof EditProductInput)[] = [
      "productName",
      "category",
      "description",
      "sellingPrice",
    ];
    const result = await form.trigger(basicInfoFields);
    if (result) {
      goToNextTab();
    } else {
      toast.error(
        "Please fill in all required basic info fields correctly before proceeding",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="min-h-[600px] max-h-[80vh] flex flex-col">
          <CardHeader>
            <CardTitle>Edit Product: {product.productName}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                <TabsTrigger value="variations">Product Variations</TabsTrigger>
              </TabsList>
              <div className="mt-6 flex-1 overflow-hidden">
                <TabsContent
                  value="basic-info"
                  className="h-full flex flex-col mt-0"
                >
                  {/* Pass correct props to the adapted tab */}
                  <ProductBasicInfoTab
                    form={form} // Pass the form instance typed for EditProductInput
                    displayPrice={displayPrice}
                    setDisplayPrice={setDisplayPrice}
                    formatCurrency={formatCurrency}
                    existingProductImageUrl={product.productImgUrl} // Pass existing URL
                    onImageChange={handleProductImageChange} // Pass specific handler
                  />
                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      onClick={validateBasicInfoAndProceed}
                      disabled={loading}
                    >
                      Next: Variations
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent
                  value="variations"
                  className="h-full flex flex-col mt-0"
                >
                  {/* Pass correct props to the adapted tab */}
                  <ProductVariationsTab
                    form={form} // Pass the form instance typed for EditProductInput
                    fields={fields}
                    append={append}
                    remove={remove}
                    formatCurrency={formatCurrency}
                    allowedImageTypes={ALLOWED_IMAGE_TYPES}
                    existingVariations={product.variations} // Pass existing variations
                    variationImages={newVariationImages} // Pass state for NEW images
                    handleVariationImageChange={handleVariationImageChange} // Pass handler
                  />
                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousTab}
                      disabled={loading}
                    >
                      Back: Basic Info
                    </Button>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => router.push("/admin/products/update")}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Product"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

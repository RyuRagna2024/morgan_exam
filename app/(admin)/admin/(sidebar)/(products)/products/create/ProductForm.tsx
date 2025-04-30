// app/(admin)/admin/products/create/ProductForm.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct } from "./actions"; // Action for creating
import { useState } from "react";
import { toast } from "sonner";
import { CreateProductInput, createProductSchema } from "./validations"; // Validation schema for create
import { ALLOWED_IMAGE_TYPES } from "./types"; // Types specific to this context
import { ProductBasicInfoTab } from "./_components/ProductBasicInfoTab"; // Import Tab component
import { ProductVariationsTab } from "./_components/ProductVariationsTab"; // Import Tab component
import { useRouter } from "next/navigation"; // Import router for potential navigation

export function CreateProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayPrice, setDisplayPrice] = useState("0.00");
  const [activeTab, setActiveTab] = useState("basic-info");
  const [variationImages, setVariationImages] = useState<{
    [key: number]: File | null;
  }>({});

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      productName: "",
      category: [],
      description: "",
      sellingPrice: 0,
      isPublished: true,
      isFeatured: false,
      variations: [
        {
          name: "",
          color: "",
          size: "",
          sku: "",
          quantity: 0,
          price: 0,
          variationImage: undefined,
        },
      ],
      productImage: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const formatCurrency = (value: string | undefined | null): string => {
    if (!value) return "";
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + (parts[1] || "");
    }
    return numericValue || "";
  };

  const handleVariationImageChange = (
    index: number,
    files: FileList | null,
  ) => {
    setVariationImages((prev) => ({ ...prev, [index]: files?.[0] || null }));
  };

  // Handler specifically for the MAIN Product Image in the CREATE form
  const handleMainImageChangeForCreate = (files: FileList | null) => {
    const file = files?.[0];
    // --- FIX: Only set value if it's a valid File ---
    if (file instanceof File) {
      form.setValue("productImage", file, { shouldValidate: true });
    }
    // --- NO ELSE BLOCK NEEDED for create form ---
    // If no file, the 'required' validation in the schema will handle it
  };

  // Submit handler for creating a product
  async function onSubmit(data: CreateProductInput) {
    setLoading(true);
    const formData = new FormData();

    // Validation before submitting
    if (!data.productImage || !(data.productImage instanceof File)) {
      toast.error("Product image is required and must be a valid file.");
      setLoading(false);
      return;
    }
    const variationsData = form.getValues("variations") || [];
    let allVariationImagesPresent = true;
    if (variationsData.length > 0) {
      for (let i = 0; i < variationsData.length; i++) {
        // Check the state map for the actual file, not RHF state
        if (!variationImages[i]) {
          allVariationImagesPresent = false;
          toast.error(`Image is required for Variation ${i + 1}.`);
          break;
        }
      }
    }
    if (!allVariationImagesPresent && variationsData.length > 0) {
      setLoading(false);
      setActiveTab("variations");
      return;
    }

    // Append basic data
    formData.append("productImage", data.productImage);
    formData.append("productName", data.productName);
    data.category.forEach((cat) => formData.append("category", cat));
    formData.append("description", data.description);
    formData.append("sellingPrice", data.sellingPrice.toString());
    formData.append("isPublished", data.isPublished.toString());
    formData.append("isFeatured", data.isFeatured?.toString() ?? "false");

    // Append variations and images
    if (variationsData && variationsData.length > 0) {
      formData.append("variations", JSON.stringify(variationsData));
      variationsData.forEach((_, index) => {
        const file = variationImages[index];
        if (file) {
          formData.append(`variationImage_${index}`, file);
        }
        // Should have already validated that file exists if variationsData has items
      });
    } else {
      formData.append("variations", JSON.stringify([]));
    }

    // Call server action
    try {
      const result = await createProduct(formData);
      if (!result.success) {
        throw new Error(result.error || "Creation failed");
      }
      toast.success("Product created successfully!");
      form.reset();
      setVariationImages({});
      setDisplayPrice("0.00");
      setActiveTab("basic-info");
      // router.push('/admin/products/update');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  }

  // Tab navigation functions
  const goToNextTab = () => {
    if (activeTab === "basic-info") setActiveTab("variations");
  };
  const goToPreviousTab = () => {
    if (activeTab === "variations") setActiveTab("basic-info");
  };

  const validateBasicInfoAndProceed = async () => {
    const basicInfoFields: (keyof CreateProductInput)[] = [
      "productName",
      "productImage",
      "category",
      "description",
      "sellingPrice",
    ];
    const result = await form.trigger(basicInfoFields);
    if (result) {
      goToNextTab();
    } else {
      toast.error(
        "Please fill in all required fields correctly before proceeding",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="min-h-[600px] max-h-[80vh] flex flex-col">
          <CardHeader>
            {" "}
            <CardTitle>Create New Product</CardTitle>{" "}
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
                  className="h-full flex flex-col mt-0 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <ProductBasicInfoTab
                    form={form}
                    displayPrice={displayPrice}
                    setDisplayPrice={setDisplayPrice}
                    formatCurrency={formatCurrency}
                    onImageChange={handleMainImageChangeForCreate}
                  />
                  <div className="flex justify-end mt-auto pt-6 border-t">
                    <Button
                      type="button"
                      onClick={validateBasicInfoAndProceed}
                      disabled={loading}
                    >
                      {" "}
                      Next: Variations{" "}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent
                  value="variations"
                  className="h-full flex flex-col mt-0 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <ProductVariationsTab
                    form={form as any} // Casts might still be needed depending on strictness
                    fields={fields as any}
                    append={append as any}
                    remove={remove}
                    formatCurrency={formatCurrency}
                    variationImages={variationImages}
                    handleVariationImageChange={handleVariationImageChange}
                    allowedImageTypes={ALLOWED_IMAGE_TYPES}
                    // No existingVariations in create mode
                  />
                  <div className="flex justify-between mt-auto pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousTab}
                      disabled={loading}
                    >
                      {" "}
                      Back: Basic Info{" "}
                    </Button>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setVariationImages({});
                          setDisplayPrice("0.00");
                          setActiveTab("basic-info");
                        }}
                        disabled={loading}
                      >
                        {" "}
                        Cancel{" "}
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {" "}
                        {loading ? "Creating..." : "Create Product"}{" "}
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

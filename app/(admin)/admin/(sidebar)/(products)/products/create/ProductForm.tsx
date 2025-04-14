"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct } from "./actions";
import { useState } from "react";
import { toast } from "sonner";
import { CreateProductInput, createProductSchema } from "./validations";
import { ALLOWED_IMAGE_TYPES } from "./types";
import { ProductBasicInfoTab } from "./_components/ProductBasicInfoTab";
import { ProductVariationsTab } from "./_components/ProductVariationsTab";

export function CreateProductForm() {
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
    },
  });

  // Create a field array for variations
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  // Function to format currency input
  const formatCurrency = (value: string) => {
    // Allow only numbers and one decimal point
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) return parts[0] + "." + parts[1]; // Prevent multiple decimal points

    return numericValue;
  };

  // Function to handle variation image change
  const handleVariationImageChange = (
    index: number,
    files: FileList | null,
  ) => {
    if (files && files.length > 0) {
      setVariationImages((prev) => ({
        ...prev,
        [index]: files[0],
      }));
    }
  };

  async function onSubmit(data: CreateProductInput) {
    try {
      setLoading(true);
      const formData = new FormData();

      // Make sure we have all the required files
      if (!data.productImage) {
        throw new Error("Product image is required");
      }

      // Check if all variations have images
      const missingImageVariation = data.variations?.findIndex(
        (_, index) => !variationImages[index],
      );

      if (missingImageVariation !== undefined && missingImageVariation >= 0) {
        throw new Error(
          `Image is required for variation ${missingImageVariation + 1}`,
        );
      }

      formData.append("productImage", data.productImage);
      formData.append("productName", data.productName);
      data.category.forEach((cat) => formData.append("category", cat));
      formData.append("description", data.description);
      formData.append("sellingPrice", data.sellingPrice.toString());
      formData.append("isPublished", data.isPublished.toString());

      // Process variations if they exist
      if (data.variations && data.variations.length > 0) {
        // Attach variation data
        formData.append("variations", JSON.stringify(data.variations));

        // Add each variation image to formData with indexed keys
        data.variations.forEach((_, index) => {
          const file = variationImages[index];
          if (file) {
            formData.append(`variationImage_${index}`, file);
          }
        });
      }

      const result = await createProduct(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Product created successfully!");
      form.reset();
      setVariationImages({});
      setDisplayPrice("0.00");
      setActiveTab("basic-info");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create product",
      );
    } finally {
      setLoading(false);
    }
  }

  const goToNextTab = () => {
    if (activeTab === "basic-info") {
      setActiveTab("variations");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "variations") {
      setActiveTab("basic-info");
    }
  };

  // Validate basic info before allowing to proceed to variations
  const validateBasicInfoAndProceed = async () => {
    const basicInfoFields = [
      "productName",
      "productImage",
      "category",
      "description",
      "sellingPrice",
    ];
    const result = await form.trigger(basicInfoFields as any);

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
            <CardTitle>Create New Product</CardTitle>
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
                  <ProductBasicInfoTab
                    form={form}
                    displayPrice={displayPrice}
                    setDisplayPrice={setDisplayPrice}
                    formatCurrency={formatCurrency}
                  />

                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <Button type="button" onClick={validateBasicInfoAndProceed}>
                      Next: Variations
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent
                  value="variations"
                  className="h-full flex flex-col mt-0"
                >
                  <ProductVariationsTab
                    form={form}
                    fields={fields}
                    append={append}
                    remove={remove}
                    formatCurrency={formatCurrency}
                    variationImages={variationImages}
                    handleVariationImageChange={handleVariationImageChange}
                    allowedImageTypes={ALLOWED_IMAGE_TYPES}
                  />

                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousTab}
                    >
                      Back: Basic Info
                    </Button>

                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Product"}
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

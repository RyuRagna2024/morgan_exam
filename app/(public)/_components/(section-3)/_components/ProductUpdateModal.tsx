// app/(public)/_components/(section-3)/_components/ProductUpdateModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Star, Loader2 } from "lucide-react";
import { StoreItem } from "../types"; // Adjust path as needed
import Image from "next/image"; // Import Image for preview

// --- Define Zod schemas for update ---
// Base schema with common fields
const updateSchemaBase = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating required")
    .max(5, "Rating must be 1-5"), // Coerce to number
  image: z.instanceof(File).optional().nullable(), // Image is optional on update
});

// Schema for New Arrivals / Best Sellers
const updateStandardSchema = updateSchemaBase.extend({
  price: z.coerce.number().positive("Price must be a positive number"), // Coerce to number
});

// Schema for On Sale items
const updateOnSaleSchema = updateSchemaBase
  .extend({
    originalPrice: z.coerce
      .number()
      .positive("Original price must be a positive number"),
    salePrice: z.coerce
      .number()
      .positive("Sale price must be a positive number"),
  })
  .refine((data) => data.salePrice < data.originalPrice, {
    message: "Sale price must be less than original price",
    path: ["salePrice"],
  });
// --- End Schemas ---

interface ProductUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: StoreItem; // Data to pre-fill the form
  onSubmit: (id: string, formData: FormData) => Promise<boolean>; // Function to call server action
  isLoading: boolean;
  tabName: string; // To determine which fields/schema to use
}

// Determine the correct schema type based on itemData presence
type FormValues =
  | z.infer<typeof updateStandardSchema>
  | z.infer<typeof updateOnSaleSchema>;

const ProductUpdateModal: React.FC<ProductUpdateModalProps> = ({
  isOpen,
  onClose,
  itemData,
  onSubmit,
  isLoading,
  tabName,
}) => {
  // Determine schema and default values based on itemData
  const isSaleItem =
    "originalPrice" in itemData && itemData.originalPrice !== undefined;
  const currentSchema = isSaleItem ? updateOnSaleSchema : updateStandardSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(currentSchema),
    // Default values are set using useEffect below to handle dynamic itemData
  });

  // State for image preview
  const [imagePreview, setImagePreview] = useState<string | null>(
    itemData.imageUrl ?? null,
  );

  // Reset form and preview when itemData changes or modal opens/closes
  useEffect(() => {
    if (isOpen && itemData) {
      form.reset({
        name: itemData.name ?? "",
        rating: itemData.rating ?? 0,
        image: null, // Reset file input
        ...(isSaleItem
          ? {
              originalPrice: itemData.originalPrice ?? 0,
              salePrice: itemData.salePrice ?? 0,
            }
          : {
              price: itemData.price ?? 0,
            }),
      });
      setImagePreview(itemData.imageUrl ?? null); // Set initial preview
    } else if (!isOpen) {
      // Optionally reset when closing if needed
      // form.reset();
      // setImagePreview(null);
    }
  }, [itemData, form, isSaleItem, isOpen]); // Add isOpen dependency

  const handleFormSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("rating", values.rating.toString());

    // Append correct price fields
    if (isSaleItem && "originalPrice" in values && "salePrice" in values) {
      formData.append("originalPrice", values.originalPrice.toString());
      formData.append("salePrice", values.salePrice.toString());
    } else if ("price" in values) {
      formData.append("price", values.price.toString());
    }

    // Only append image if a new one was selected in the form
    if (values.image instanceof File) {
      formData.append("image", values.image);
    }

    await onSubmit(itemData.id, formData);
    // Parent component (ProductSlide) handles closing the modal on success/failure via promise return
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file); // Update RHF state
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("image", null); // Clear file state
      setImagePreview(itemData.imageUrl ?? null); // Revert to original preview
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update {itemData.name}</DialogTitle>{" "}
          {/* Use item name */}
        </DialogHeader>
        <Form {...form}>
          {/* Pass itemData.id and formData to onSubmit */}
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 py-4"
          >
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4">
                <Label>Image Preview</Label>
                <div className="mt-2 aspect-video relative w-full h-40 rounded border border-border overflow-hidden bg-secondary">
                  <Image
                    src={imagePreview}
                    alt="Current image preview"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            )}

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Fields */}
            {isSaleItem ? (
              <>
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Image Field */}
            <FormField
              control={form.control}
              name="image"
              render={(
                { field: { value, onChange, ...fieldProps } }, // Destructure onChange correctly
              ) => (
                <FormItem>
                  <FormLabel>New Image (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps} // Pass down other props like name, ref
                      type="file"
                      accept="image/*"
                      disabled={isLoading}
                      onChange={handleFileChange} // Use custom handler
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rating Field */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            value <= field.value
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200 dark:text-gray-600 dark:hover:text-yellow-500"
                          }`}
                          onClick={() => field.onChange(value)} // Use RHF's onChange
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUpdateModal;

"use client";

import Image from "next/image";
// Import necessary types, including Path
import {
  Control,
  FieldValues,
  FieldArrayWithId,
  UseFormReturn,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldPath,
} from "react-hook-form";
import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, X } from "lucide-react";
import { Variation } from "@/app/(admin)/admin/(sidebar)/(products)/products/create/types"; // Adjust path
// Import specific input types from validations file
import {
  CreateProductInput,
  EditProductInput,
} from "@/app/(admin)/admin/(sidebar)/(products)/products/create/validations"; // Adjust path

// Define Union Type for the form input
type ProductFormInput = CreateProductInput | EditProductInput;

// Shape expected by append / Variation structure within the form
type VariationFormData = {
  name: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  price: number;
  variationImage?: File | null | undefined;
  id?: string; // Optional ID for existing variations
};
// Define keys of VariationFormData that are strings and can be used as field names
type VariationFormFieldName = Extract<keyof VariationFormData, string>;

// --- Props Interface for the INNER Item Component ---
interface VariationFormItemProps {
  field: FieldArrayWithId<ProductFormInput, "variations", "id">;
  index: number;
  form: UseFormReturn<ProductFormInput>;
  remove: UseFieldArrayRemove;
  formatCurrency: (value: string) => string;
  existingImageUrl?: string;
  newImageFile?: File | null;
  handleVariationImageChange: (index: number, files: FileList | null) => void;
  allowedImageTypes: readonly string[];
}

// --- Helper Component for Individual Variation Form ---
function VariationFormItem({
  field,
  index,
  form,
  remove,
  formatCurrency,
  existingImageUrl,
  newImageFile,
  handleVariationImageChange,
  allowedImageTypes,
}: VariationFormItemProps) {
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);

  // Effect to create/revoke preview URL for the NEW image file
  useEffect(() => {
    let objectUrl: string | null = null;
    if (newImageFile) {
      objectUrl = URL.createObjectURL(newImageFile);
      setNewPreviewUrl(objectUrl);
    } else {
      setNewPreviewUrl(null);
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [newImageFile]);

  const fileAcceptString = allowedImageTypes.join(",");

  // --- CORRECTED Helper to build field path string ---
  // Ensures fieldName is a valid string key of VariationFormData
  const getFieldName = (
    fieldName: VariationFormFieldName,
  ): `variations.${number}.${VariationFormFieldName}` => {
    return `variations.${index}.${fieldName}`;
  };

  return (
    <AccordionItem
      key={field.id}
      value={`variation-${index}`}
      className="border rounded-md mb-4 last:mb-0 bg-card"
    >
      <div className="flex justify-between items-center px-4">
        <AccordionTrigger className="flex-grow py-3 hover:no-underline">
          {/* Use helper, cast to any for watch if Path struggles */}
          <span>
            {" "}
            {form.watch(getFieldName("name") as any) ||
              `Variation ${index + 1}`}{" "}
          </span>
        </AccordionTrigger>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          disabled={form.formState.isSubmitting}
          onClick={(e) => {
            e.stopPropagation();
            remove(index);
          }}
          aria-label={`Remove Variation ${index + 1}`}
        >
          {" "}
          <X className="h-4 w-4" />{" "}
        </Button>
      </div>
      <AccordionContent className="px-4 pb-4 border-t">
        <div className="grid grid-cols-2 gap-4 pt-4">
          {/* Use helper function for field names */}
          <FormField
            control={form.control as Control<any>}
            name={getFieldName("name")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variation Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Small Blue"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as Control<any>}
            name={getFieldName("sku")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input
                    placeholder="SKU-123-BLU-S"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as Control<any>}
            name={getFieldName("color")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Blue"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as Control<any>}
            name={getFieldName("size")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input
                    placeholder="S, M, L, XL, etc."
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as Control<any>}
            name={getFieldName("quantity")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as Control<any>}
            name={getFieldName("price")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={
                      field.value === 0 ? "" : (field.value?.toString() ?? "")
                    }
                    onChange={(e) => {
                      const val = formatCurrency(e.target.value);
                      field.onChange(val ? parseFloat(val) : 0);
                    }}
                    onBlur={(e) => {
                      if (field.value != null) {
                        field.onChange(parseFloat(field.value.toFixed(2)));
                      }
                    }}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Variation Image Field */}
          <FormItem className="col-span-2">
            <FormLabel>
              Variation Image {existingImageUrl ? "(Optional Replacement)" : ""}
            </FormLabel>
            {/* Previews... */}
            {existingImageUrl && !newPreviewUrl && (
              <div className="mt-1 mb-2">{/*...*/}</div>
            )}
            {newPreviewUrl && <div className="mt-1 mb-2">{/*...*/}</div>}
            <FormControl>
              <Input
                type="file"
                accept={fileAcceptString}
                // Pass index and files to parent handler
                onChange={(e) =>
                  handleVariationImageChange(index, e.target.files)
                }
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
            <FormDescription>
              {existingImageUrl
                ? "Upload new to replace (max 6MB)."
                : "Upload image (max 6MB)."}
            </FormDescription>
            {/* <FormMessage /> */}
          </FormItem>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// --- Props Interface for the Main Tab Component ---
interface ProductVariationsTabProps {
  form: UseFormReturn<ProductFormInput>;
  fields: FieldArrayWithId<ProductFormInput, "variations", "id">[];
  append: UseFieldArrayAppend<ProductFormInput, "variations">;
  remove: UseFieldArrayRemove;
  formatCurrency: (value: string) => string;
  existingVariations?: Variation[];
  variationImages?: { [key: number]: File | null };
  handleVariationImageChange: (index: number, files: FileList | null) => void;
  allowedImageTypes: readonly string[];
}

// --- Main Tab Component ---
export function ProductVariationsTab({
  form,
  fields,
  append,
  remove,
  formatCurrency,
  existingVariations,
  variationImages,
  handleVariationImageChange,
  allowedImageTypes,
}: ProductVariationsTabProps) {
  return (
    <div className="max-h-[calc(70vh-140px)] overflow-y-auto pr-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Product Variations</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={form.formState.isSubmitting}
          onClick={() => {
            const defaultVariation: VariationFormData = {
              name: "",
              color: "",
              size: "",
              sku: "",
              quantity: 0,
              price: 0.0,
            };
            append(defaultVariation as any); // Use 'as any' cast
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Variation
        </Button>
      </div>

      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={fields.map((_, index) => `variation-${index}`)}
      >
        {fields.map((field, index) => (
          // Pass props down to the item component
          <VariationFormItem
            key={field.id}
            field={field}
            index={index}
            form={form}
            remove={remove}
            formatCurrency={formatCurrency}
            // Find existing URL using the ID from the form state if available
            existingImageUrl={
              existingVariations?.find(
                (v) =>
                  v.id === form.getValues(`variations.${index}` as any)?.id,
              )?.imageUrl
            }
            newImageFile={variationImages?.[index]}
            handleVariationImageChange={handleVariationImageChange}
            allowedImageTypes={allowedImageTypes}
          />
        ))}
      </Accordion>

      {/* No variations message */}
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground mb-4">No variations added yet.</p>
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => {
              const defaultVariation: VariationFormData = {
                name: "",
                color: "",
                size: "",
                sku: "",
                quantity: 0,
                price: 0.0,
              };
              append(defaultVariation as any); // Use 'as any' cast
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Your First Variation
          </Button>
        </div>
      )}
    </div>
  );
}

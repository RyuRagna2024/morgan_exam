"use client";

import Image from "next/image";
// Ensure all necessary RHF types are imported
import {
  Control,
  FieldValues,
  FieldArrayWithId,
  UseFormReturn,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldPath,
  PathValue,
} from "react-hook-form";
import React, { useEffect, useState } from "react"; // <<< Import React and useState
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
import { Variation } from "@/app/(admin)/admin/(sidebar)/(products)/products/create/types"; // Adjust path as necessary
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
  id?: string;
};
// Define keys of VariationFormData that are strings and can be used as field names
type VariationFormFieldName = Extract<keyof VariationFormData, string>;

// --- Props Interface for the INNER Item Component ---
interface VariationFormItemProps {
  field: FieldArrayWithId<ProductFormInput, "variations", "id">;
  index: number;
  form: UseFormReturn<ProductFormInput>; // Use Union Type
  remove: UseFieldArrayRemove;
  formatCurrency: (value: string) => string;
  existingImageUrl?: string; // Optional for edit mode
  newImageFile?: File | null; // Optional for edit mode preview
  handleVariationImageChange: (index: number, files: FileList | null) => void;
  allowedImageTypes: readonly string[];
}

// --- Helper Component for Individual Variation Form ---
function VariationFormItem({
  field, // field object from useFieldArray
  index,
  form,
  remove,
  formatCurrency,
  existingImageUrl,
  newImageFile, // The NEW file staged for upload (for preview)
  handleVariationImageChange, // The function to call when file input changes
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
      setNewPreviewUrl(null); // Clear preview if file removed/deselected
    }
    // Cleanup function to revoke URL when component unmounts or file changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [newImageFile]); // Depend only on the specific new image file for this item

  const fileAcceptString = allowedImageTypes.join(",");

  // Helper to build field path string safely
  const getFieldName = (
    fieldName: VariationFormFieldName,
  ): `variations.${number}.${VariationFormFieldName}` => {
    return `variations.${index}.${fieldName}`;
  };

  return (
    <AccordionItem
      key={field.id} // Use stable ID from useFieldArray
      value={`variation-${index}`} // Use index for Accordion value
      className="border rounded-md mb-4 last:mb-0 bg-card"
    >
      <div className="flex justify-between items-center px-4">
        <AccordionTrigger className="flex-grow py-3 hover:no-underline">
          {/* Use helper with 'as any' if Path type causes issues */}
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
          {/* Variation Fields using helper */}
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
            {/* Show current image if editing and one exists and no new preview */}
            {existingImageUrl && !newPreviewUrl && (
              <div className="mt-1 mb-2">
                <p className="text-xs text-muted-foreground mb-1">Current:</p>
                <Image
                  src={existingImageUrl}
                  alt={`Current variation ${index + 1}`}
                  width={64}
                  height={64}
                  className="rounded border bg-muted object-contain"
                />
              </div>
            )}
            {/* Show preview of NEWLY selected file */}
            {newPreviewUrl && (
              <div className="mt-1 mb-2">
                <p className="text-xs text-muted-foreground mb-1">
                  New Preview:
                </p>
                <Image
                  src={newPreviewUrl}
                  alt={`New variation ${index + 1} preview`}
                  width={64}
                  height={64}
                  className="rounded border bg-muted object-contain"
                />
              </div>
            )}
            <FormControl>
              <Input
                type="file"
                accept={fileAcceptString}
                // Call the handler passed from parent when file selection changes
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
            {/* <FormMessage /> If needed, requires manual error setting from parent */}
          </FormItem>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// --- Props Interface for the Main Tab Component ---
// Uses the specific ProductFormInput union type
interface ProductVariationsTabProps {
  form: UseFormReturn<ProductFormInput>;
  fields: FieldArrayWithId<ProductFormInput, "variations", "id">[];
  append: UseFieldArrayAppend<ProductFormInput, "variations">;
  remove: UseFieldArrayRemove;
  formatCurrency: (value: string) => string;
  // Optional props passed down from EditProductForm
  existingVariations?: Variation[];
  variationImages?: { [key: number]: File | null }; // State map of NEW images
  handleVariationImageChange: (index: number, files: FileList | null) => void; // Handler for NEW images
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
  variationImages, // Map of NEW files being staged
  handleVariationImageChange, // Function to update the NEW files map
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
            // Define the default structure for a new variation item
            const defaultVariation = {
              name: "",
              color: "",
              size: "",
              sku: "",
              quantity: 0,
              price: 0.0,
            };
            // Append this structure to the form's field array
            append(defaultVariation as any); // Cast might be needed for complex types
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
          // Render the item component for each field in the array
          <VariationFormItem
            key={field.id} // Unique key from useFieldArray
            field={field} // Pass the field object
            index={index} // Pass the index
            form={form} // Pass the main form instance
            remove={remove} // Pass the remove function
            formatCurrency={formatCurrency}
            // Find existing variation data based on ID (present in edit mode)
            existingImageUrl={
              existingVariations?.find(
                (v) =>
                  v.id === form.getValues(`variations.${index}` as any)?.id,
              )?.imageUrl
            }
            // Pass the specific NEW file (if any) staged for this index
            newImageFile={variationImages?.[index]}
            // Pass the handler function for the file input
            handleVariationImageChange={handleVariationImageChange}
            allowedImageTypes={allowedImageTypes}
          />
        ))}
      </Accordion>

      {/* Message shown when there are no variations */}
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground mb-4">No variations added yet.</p>
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => {
              const defaultVariation = {
                name: "",
                color: "",
                size: "",
                sku: "",
                quantity: 0,
                price: 0.0,
              };
              append(defaultVariation as any);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Your First Variation
          </Button>
        </div>
      )}
    </div>
  );
}

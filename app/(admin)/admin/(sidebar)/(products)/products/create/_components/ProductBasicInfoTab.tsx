// app/(admin)/admin/products/create/_components/ProductBasicInfoTab.tsx
"use client";

import Image from "next/image";
import { Control, FieldValues, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ALLOWED_IMAGE_TYPES } from "@/app/(admin)/admin/(sidebar)/(products)/products/create/types";

interface ProductBasicInfoTabProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  displayPrice: string;
  setDisplayPrice: (value: string) => void;
  formatCurrency: (value: string) => string;
  existingProductImageUrl?: string | null;
  onImageChange: (files: FileList | null) => void;
}

export function ProductBasicInfoTab<T extends FieldValues>({
  form,
  displayPrice,
  setDisplayPrice,
  formatCurrency,
  existingProductImageUrl,
  onImageChange,
}: ProductBasicInfoTabProps<T>) {
  const fileAcceptString = ALLOWED_IMAGE_TYPES.join(",");

  return (
    <div className="max-h-[calc(70vh-80px)] overflow-y-auto pr-2 space-y-5">
      {/* Existing Image Preview */}
      {existingProductImageUrl && (
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Current Image:
          </p>
          <Image
            src={existingProductImageUrl}
            alt="Current product image"
            width={80}
            height={80}
            className="rounded border bg-muted object-contain"
          />
        </div>
      )}

      {/* Product Image Field */}
      <FormField
        control={form.control as Control<any>}
        name="productImage"
        render={({ field: { ref, name, onBlur, value, ...fieldProps } }) => (
          <FormItem>
            <FormLabel>
              {existingProductImageUrl
                ? "Replace Image (Optional)"
                : "Product Image"}
            </FormLabel>
            <FormControl>
              <Input
                {...fieldProps}
                ref={ref}
                name={name}
                onBlur={onBlur}
                type="file"
                accept={fileAcceptString}
                onChange={(e) => onImageChange(e.target.files)}
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
            <FormDescription>
              {existingProductImageUrl
                ? "Upload new to replace (max 6MB)."
                : "Upload image (max 6MB)."}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Grid for Name & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* --- PUT RENDER PROP BACK --- */}
        <FormField
          control={form.control as Control<any>}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter product name"
                  {...field}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- PUT RENDER PROP BACK --- */}
        <FormField
          control={form.control as Control<any>}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={displayPrice}
                  disabled={form.formState.isSubmitting}
                  onChange={(e) => {
                    const value = formatCurrency(e.target.value);
                    setDisplayPrice(value);
                    field.onChange(value ? parseFloat(value) : 0);
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(displayPrice || "0").toFixed(2);
                    setDisplayPrice(value);
                    field.onChange(parseFloat(value));
                  }}
                />
              </FormControl>
              <FormDescription>Base price before variations</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* --- PUT RENDER PROP BACK --- */}
      <FormField
        control={form.control as Control<any>}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categories</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter categories separated by commas"
                value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                disabled={form.formState.isSubmitting}
                onChange={(e) => {
                  const cats = e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean);
                  field.onChange(cats);
                }}
              />
            </FormControl>
            <FormDescription>
              {" "}
              Enter up to 5 categories, separated by commas (e.g., Apparel,
              Mens, T-Shirt){" "}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- PUT RENDER PROP BACK --- */}
      <FormField
        control={form.control as Control<any>}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter product description"
                className="resize-none h-24"
                {...field}
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Grid for Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* --- PUT RENDER PROP BACK --- */}
        <FormField
          control={form.control as Control<any>}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish</FormLabel>
                <FormDescription>Make product visible.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* --- PUT RENDER PROP BACK --- */}
        <FormField
          control={form.control as Control<any>}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Featured</FormLabel>
                <FormDescription>Display on featured sections.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

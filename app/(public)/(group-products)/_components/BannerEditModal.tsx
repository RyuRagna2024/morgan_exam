// app/(public)/(group-products)/_components/BannerEditModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Loader2 } from "lucide-react";

// Import the server action - ADJUST PATH AS NEEDED
import { upsertCollectionBanner } from "@/app/(public)/(group-products)/_actions/bannerManagementActions";

// Validation Schema
const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Make 'image' optional in the schema, but require it during submission logic if needed
const bannerEditSchema = z.object({
  image: z
    .custom<FileList>() // Accept FileList
    .refine(
      (files) => !files || files.length <= 1,
      "Only one file can be selected.",
    ) // Ensure 0 or 1 file
    .refine(
      (files) => !files || files?.[0]?.size <= MAX_FILE_SIZE,
      `Max image size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    )
    .refine(
      (files) => !files || ALLOWED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp, and .gif formats are supported.",
    )
    .nullable() // Allow null
    .optional(), // Make it optional at the schema level initially
});

type BannerEditFormValues = z.infer<typeof bannerEditSchema>;

interface BannerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  categoryName: string;
  currentImageUrl: string | null | undefined;
  onSuccess: (newImageUrl: string) => void;
}

export default function BannerEditModal({
  isOpen,
  onClose,
  category,
  categoryName,
  currentImageUrl,
  onSuccess,
}: BannerEditModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<BannerEditFormValues>({
    resolver: zodResolver(bannerEditSchema),
    defaultValues: {
      image: null, // Default to null instead of undefined
    },
  });

  useEffect(() => {
    if (isOpen) {
      setImagePreview(currentImageUrl ?? null);
      form.reset({ image: null }); // Reset file input to null on open
    } else {
      setImagePreview(null);
    }
  }, [isOpen, currentImageUrl, form]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        // Create a new FileList-like object (DataTransfer is a common way)
        // Although react-hook-form might handle the FileList directly now,
        // explicitly handling it might be safer across versions.
        // Let's try letting RHF handle the FileList directly first.
        form.setValue("image", files, { shouldValidate: true });
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // --- FIX: Set value to null when clearing ---
        form.setValue("image", null, { shouldValidate: true }); // Use null
        // --- End Fix ---
        setImagePreview(currentImageUrl ?? null);
      }
    },
    [form, currentImageUrl],
  );

  const handleFormSubmit = async (values: BannerEditFormValues) => {
    const file = values.image?.[0]; // Get the first file from the FileList

    // Now require the file *at submission time* even though schema is optional
    if (!file) {
      toast.error("An image file is required to update the banner.");
      // Manually trigger validation display for the field if desired
      form.setError("image", {
        type: "manual",
        message: "An image file is required.",
      });
      return;
    }
    // Double-check validation results manually if needed (RHF should prevent submission if invalid)
    const validationResult = bannerEditSchema.safeParse(values);
    if (!validationResult.success) {
      console.error(
        "Form validation failed despite submission:",
        validationResult.error,
      );
      toast.error("Validation failed. Please check the image file.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("image", file); // Append the single File

    try {
      const result = await upsertCollectionBanner(category, formData);
      if (result.success && result.newImageUrl) {
        toast.success(result.message || "Banner updated!");
        onSuccess(result.newImageUrl);
        onClose();
      } else {
        throw new Error(result.error || "Failed to save banner.");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Banner for {categoryName}</DialogTitle>
          <DialogDescription>
            Upload a new banner image. Recommended aspect ratio: wide (e.g.,
            4:1). Max size 6MB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 py-2"
          >
            <FormItem>
              <FormLabel>Image Preview</FormLabel>
              <div className="mt-1 aspect-[4/1] relative w-full h-auto rounded border border-dashed border-border overflow-hidden bg-secondary flex items-center justify-center text-muted-foreground">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Banner preview"
                    layout="fill"
                    objectFit="contain"
                  />
                ) : (
                  <span>Current banner (if any) or new image preview</span>
                )}
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="image"
              render={(
                { field: { ref, name, onBlur } }, // Removed onChange from destructuring here
              ) => (
                <FormItem>
                  <FormLabel>New Banner Image File</FormLabel>
                  <FormControl>
                    <Input
                      id={`file-upload-${category}`}
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      disabled={isSaving}
                      onChange={handleFileChange} // Custom handler handles RHF's setValue
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
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
                  disabled={isSaving}
                >
                  {" "}
                  Cancel{" "}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isValid}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Uploading..." : "Upload & Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

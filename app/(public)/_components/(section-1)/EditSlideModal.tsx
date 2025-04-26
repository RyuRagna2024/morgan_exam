// app/(public)/_components/(section-1)/EditSlideModal.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { type Slide } from "./types";
import { z } from "zod";
import { useSlideStore } from "./_crud-actions/_store/use-slide-store";
import Image from "next/image";

// Modified schema to handle existing images
const editSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bgColor: z.string().min(1, "Background color is required"),
  order: z.number().min(1, "Order must be at least 1"),
  sliderImage: z.any().optional(), // Make the image field optional for editing
  currentImageUrl: z.string().optional(), // Add field for tracking current image
});

type EditSlideFormValues = z.infer<typeof editSlideSchema>;

interface EditSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slide: Slide;
}

const bgColorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
];

const EditSlideModal: React.FC<EditSlideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  slide,
}) => {
  const [loading, setLoading] = useState(false);
  const { updateSlide } = useSlideStore();

  const form = useForm<EditSlideFormValues>({
    resolver: zodResolver(editSlideSchema),
    defaultValues: {
      title: slide.title,
      description: slide.description,
      bgColor: slide.bgColor,
      order: slide.order,
      currentImageUrl: slide.sliderImageurl, // Initialize with current image URL
      sliderImage: undefined,
    },
  });

  async function onSubmit(data: EditSlideFormValues) {
    try {
      setLoading(true);
      const formData = new FormData();

      // Only append new image if one was selected
      if (data.sliderImage instanceof File) {
        formData.append("sliderImage", data.sliderImage);
      }

      formData.append("id", slide.id);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("bgColor", data.bgColor);
      formData.append("order", data.order.toString());

      const result = await updateSlide(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Slide updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update slide",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Slide</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sliderImage"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Slide Image</FormLabel>
                  {slide.sliderImageurl && (
                    <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={slide.sliderImageurl}
                        alt="Current slide"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file); // Update form field
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a new slide image (max 6MB) or leave empty to keep
                    the current image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter slide title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bgColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {bgColorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter slide description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Slide"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSlideModal;

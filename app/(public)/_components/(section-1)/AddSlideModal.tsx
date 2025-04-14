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
import { createSlideSchema, type CreateSlideInput } from "./validations";
import { useSlideStore } from "./_crud-actions/_store/use-slide-store";

// We define the props interface to include targetIndex for proper slide ordering
interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetIndex: number; // This determines where the new slide will be inserted
}

// These color options provide a consistent set of choices for slide backgrounds
const bgColorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
];

const AddSlideModal: React.FC<AddSlideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetIndex,
}) => {
  const [loading, setLoading] = useState(false);
  // We get both the create and update functions since we might need to reorder existing slides
  const { createSlide, slides, updateSlide } = useSlideStore();

  // Initialize the form with the target index as the order
  const form = useForm<CreateSlideInput>({
    resolver: zodResolver(createSlideSchema),
    defaultValues: {
      title: "",
      description: "",
      bgColor: "",
      order: targetIndex + 1, // Convert from zero-based index to one-based order
    },
  });

  async function onSubmit(data: CreateSlideInput) {
    try {
      setLoading(true);

      // First, we need to handle existing slides that need to be shifted
      const existingSlides = slides.filter(
        (slide) => slide.order >= targetIndex + 1,
      );
      if (existingSlides.length > 0) {
        // Update the order of all existing slides that come after our insertion point
        for (const slide of existingSlides) {
          const updateFormData = new FormData();
          updateFormData.append("id", slide.id);
          updateFormData.append("order", String(slide.order + 1));
          await updateSlide(updateFormData);
        }
      }

      // Now prepare the data for our new slide
      const formData = new FormData();
      formData.append("sliderImage", data.sliderImage);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("bgColor", data.bgColor);
      formData.append("order", String(targetIndex + 1));

      const result = await createSlide(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Success! The store will automatically update with the new slide
      toast.success("Slide created successfully!");
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create slide",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Slide (Position {targetIndex + 1})</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload Field */}
            <FormField
              control={form.control}
              name="sliderImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slide Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a slide image (max 6MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title and Order Fields */}
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

              {/* Order field is now disabled and automatically set */}
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
                        placeholder={String(targetIndex + 1)}
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Background Color Selection */}
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

            {/* Description Field */}
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

            {/* Action Buttons */}
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
                {loading ? "Creating..." : "Create Slide"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSlideModal;

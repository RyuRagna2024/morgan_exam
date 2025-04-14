import { UseFormReturn } from "react-hook-form";
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
import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { CreateProductInput } from "../validations";

interface ProductVariationsTabProps {
  form: UseFormReturn<CreateProductInput>;
  fields: FieldArrayWithId<CreateProductInput, "variations", "id">[];
  append: UseFieldArrayAppend<CreateProductInput, "variations">;
  remove: UseFieldArrayRemove;
  formatCurrency: (value: string) => string;
  variationImages: {
    [key: number]: File | null;
  };
  handleVariationImageChange: (index: number, files: FileList | null) => void;
  allowedImageTypes: readonly string[];
}

export function ProductVariationsTab({
  form,
  fields,
  append,
  remove,
  formatCurrency,
  variationImages,
  handleVariationImageChange,
  allowedImageTypes,
}: ProductVariationsTabProps) {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Product Variations</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              color: "",
              size: "",
              sku: "",
              quantity: 0,
              price: 0,
              variationImage: undefined,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variation
        </Button>
      </div>

      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={fields.map((_, index) => `variation-${index}`)}
      >
        {fields.map((field, index) => (
          <AccordionItem
            key={field.id}
            value={`variation-${index}`}
            className="border rounded-md mb-4 last:mb-0"
          >
            {/* Fixed HTML nesting structure */}
            <div className="flex justify-between items-center px-4">
              <AccordionTrigger className="flex-grow py-3">
                <span>
                  {form.watch(`variations.${index}.name`) ||
                    `Variation ${index + 1}`}
                </span>
              </AccordionTrigger>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(index);
                  // Also remove the image
                  const newVariationImages = { ...variationImages };
                  delete newVariationImages[index];
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`variations.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Small Blue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variations.${index}.sku`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-123-BLU-S" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variations.${index}.color`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Blue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variations.${index}.size`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input placeholder="S, M, L, XL, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variations.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variations.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          value={
                            field.value === 0 ? "" : field.value.toString()
                          }
                          onChange={(e) => {
                            const value = formatCurrency(e.target.value);
                            field.onChange(value ? parseFloat(value) : 0);
                          }}
                          onBlur={(e) => {
                            if (field.value) {
                              // Format to 2 decimal places
                              const formatted = field.value.toFixed(2);
                              field.onChange(parseFloat(formatted));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem className="col-span-2">
                  <FormLabel>Variation Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={allowedImageTypes.join(",")}
                      onChange={(e) =>
                        handleVariationImageChange(index, e.target.files)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image specific to this variation (max 6MB)
                  </FormDescription>
                  {variationImages[index] && (
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Selected: {variationImages[index]?.name}
                      </p>
                    </div>
                  )}
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground mb-4">No variations added yet</p>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                name: "",
                color: "",
                size: "",
                sku: "",
                quantity: 0,
                price: 0,
                variationImage: undefined,
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Variation
          </Button>
        </div>
      )}
    </div>
  );
}

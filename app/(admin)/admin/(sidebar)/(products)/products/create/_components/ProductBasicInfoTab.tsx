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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ALLOWED_IMAGE_TYPES } from "../types";
import { CreateProductInput } from "../validations";

interface ProductBasicInfoTabProps {
  form: UseFormReturn<CreateProductInput>;
  displayPrice: string;
  setDisplayPrice: (value: string) => void;
  formatCurrency: (value: string) => string;
}

export function ProductBasicInfoTab({
  form,
  displayPrice,
  setDisplayPrice,
  formatCurrency,
}: ProductBasicInfoTabProps) {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="productImage"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormDescription>
                Upload a product image (max 6MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={displayPrice}
                  onChange={(e) => {
                    // Allow only numbers and one decimal point
                    const value = formatCurrency(e.target.value);
                    setDisplayPrice(value);
                    field.onChange(value ? parseFloat(value) : 0);
                  }}
                  onBlur={(e) => {
                    const value = displayPrice.trim();
                    let formattedValue;

                    if (!value || value === "0") {
                      formattedValue = "0.00";
                    }
                    // If already has decimals
                    else if (value.includes(".")) {
                      const [whole, decimal = ""] = value.split(".");
                      formattedValue = `${whole}.${decimal.padEnd(2, "0")}`;
                    }
                    // Integer values
                    else {
                      formattedValue = `${value}.00`;
                    }

                    setDisplayPrice(formattedValue);
                    field.onChange(parseFloat(formattedValue));
                  }}
                />
              </FormControl>
              <FormDescription>Base price before variations</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter categories separated by commas"
                  onChange={(e) => {
                    const categories = e.target.value
                      .split(",")
                      .map((cat) => cat.trim())
                      .filter(Boolean);
                    field.onChange(categories);
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter up to 5 categories, separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish</FormLabel>
                <FormDescription>
                  Make this product visible to customers
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

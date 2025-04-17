// Example: app/checkout/_components/CheckoutForm.tsx (Client Component)
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User as AuthUser } from "lucia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
// Consider using Select for Branch and Collection Method if you have predefined options
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Zod Schema for the ACTUAL CHECKOUT submission
const checkoutFormSchema = z.object({
  captivityBranch: z.string().min(1, "Branch selection is required"), // Use non-empty string validation
  methodOfCollection: z.string().min(1, "Collection method is required"), // Use non-empty string validation
  salesRep: z.string().optional(),
  referenceNumber: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().optional(),
  countryRegion: z.string().min(1, "Country/Region is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apartmentSuite: z.string().optional(),
  townCity: z.string().min(1, "Town/City is required"),
  province: z.string().min(1, "Province is required"),
  postcode: z.string().min(1, "Postcode is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  orderNotes: z.string().optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  receiveEmailReviews: z.boolean().optional().default(false),
});
type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutFormProps {
  user: AuthUser;
  // isSubmitting?: boolean; // Add if handling loading state here
  // onSubmitOrder: (data: CheckoutFormValues) => Promise<void>; // Pass submit handler from parent
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  user /*, onSubmitOrder, isSubmitting*/,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CheckoutFormValues>({
    // Add 'control' for Select
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      // --- Fields NOT pre-populated ---
      captivityBranch: "", // Explicitly empty
      methodOfCollection: "", // Explicitly empty
      agreeTerms: false, // Explicitly false

      // --- Fields that CANNOT be pre-populated (not on User) ---
      companyName: "",
      province: "",

      // --- Pre-populate from User model ---
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      countryRegion: user.country || "",
      streetAddress: user.streetAddress || "",
      apartmentSuite: user.suburb || "",
      townCity: user.townCity || "",
      postcode: user.postcode || "",
      phone: user.phoneNumber || "",
      email: user.email || "",

      // Other fields without defaults
      salesRep: "",
      referenceNumber: "",
      orderNotes: "",
      receiveEmailReviews: false,
    },
  });

  // Replace with actual submission logic passed via props or defined here
  const onSubmit = async (data: CheckoutFormValues) => {
    console.log("Checkout data:", data);
    // Example: await onSubmitOrder(data);
    alert("Submitting order (check console)"); // Placeholder
  };

  // Example options - replace with your actual data source
  const branchOptions = ["Branch A", "Branch B", "Branch C"];
  const collectionMethods = ["Standard Pickup", "Express Collection"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold">Billing & Shipping Details</h2>

      {/* --- Branch (Not pre-populated) --- */}
      {/* Example using Select - Install with `npx shadcn-ui@latest add select` if needed */}
      {/* <div className="space-y-1">
                <Label htmlFor="branch">Branch</Label>
                <Select
                    // Use Controller or custom register logic for Shadcn Select with RHF
                    // For simplicity here, just showing the input field
                    onValueChange={(value) => console.log(value)} // Replace with RHF connection
                    disabled={isSubmitting}
                >
                    <SelectTrigger id="branch">
                        <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                        {branchOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectContent>
                </Select> */}
      {/* Fallback to Input if Select setup is complex */}
      <div className="space-y-1">
        <Label htmlFor="branch">Branch</Label>
        <Input
          id="branch"
          {...register("captivityBranch")}
          placeholder="Enter branch name" /* disabled={isSubmitting} */
        />
        {errors.captivityBranch && (
          <p className="text-sm text-red-600">
            {errors.captivityBranch.message}
          </p>
        )}
      </div>

      {/* --- Collection Method (Not pre-populated) --- */}
      <div className="space-y-1">
        <Label htmlFor="collectionMethod">Collection Method</Label>
        {/* Consider using Select here too */}
        <Input
          id="collectionMethod"
          {...register("methodOfCollection")}
          placeholder="Enter collection method" /* disabled={isSubmitting} */
        />
        {errors.methodOfCollection && (
          <p className="text-sm text-red-600">
            {errors.methodOfCollection.message}
          </p>
        )}
      </div>

      {/* --- Pre-populated fields --- */}
      {/* First Name */}
      <div className="space-y-1">
        <Label htmlFor="checkout-firstName">First Name</Label>
        <Input
          id="checkout-firstName"
          {...register("firstName")} /* disabled={isSubmitting} */
        />
        {errors.firstName && (
          <p className="text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <Label htmlFor="checkout-lastName">Last Name</Label>
        <Input
          id="checkout-lastName"
          {...register("lastName")} /* disabled={isSubmitting} */
        />
        {errors.lastName && (
          <p className="text-sm text-red-600">{errors.lastName.message}</p>
        )}
      </div>

      {/* ... other pre-populated and non-prepopulated fields (company, address, etc.) ... */}
      {/* Ensure all fields from the Zod schema have a corresponding input */}

      {/* Order Notes */}
      <div className="space-y-1">
        <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
        <Textarea
          id="orderNotes"
          {...register("orderNotes")} /* disabled={isSubmitting} */
        />
        {errors.orderNotes && (
          <p className="text-sm text-red-600">{errors.orderNotes.message}</p>
        )}
      </div>

      {/* --- Agree Terms Checkbox (Not pre-populated) --- */}
      <div className="flex items-start space-x-2 pt-4">
        {" "}
        {/* Use items-start for better alignment if label wraps */}
        <Checkbox
          id="terms"
          // Manually register required for checkbox value? Check RHF docs or use Controller
          {...register("agreeTerms")}
          // disabled={isSubmitting}
          aria-describedby="terms-error" // Link error to checkbox
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="terms"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and agree to the website{" "}
            <a
              href="/terms"
              target="_blank"
              className="underline hover:text-primary"
            >
              terms and conditions
            </a>
            *
          </label>
          {errors.agreeTerms && (
            <p id="terms-error" className="text-sm text-red-600">
              {errors.agreeTerms.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" /* disabled={isSubmitting} */>
        {/* {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null} */}
        Place Order
      </Button>
    </form>
  );
};

export default CheckoutForm;

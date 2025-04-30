// app/(public)/checkout/CheckoutDetailsActualForm.tsx
"use client";

import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Use the validation schema for the actual order input
import { orderValidationSchema } from "./order-validations";
import type { OrderInput } from "./order-types";

interface CheckoutDetailsActualFormProps {
  initialData: Partial<OrderInput>; // Pre-population data from preferences/user
  onSubmit: (data: OrderInput) => Promise<void>; // Function to call when submitting to proceed
  isSubmitting: boolean; // Loading state controlled by the parent page
}

// TODO: Replace with your actual options (perhaps fetched or defined constants)
const branchOptions = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Port Elizabeth",
  "Other",
];
const collectionOptions = ["Collection", "Delivery", "Courier (Third Party)"];

const CheckoutDetailsActualForm: React.FC<CheckoutDetailsActualFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting, // Use this to disable the form during processing
}) => {
  const {
    register,
    handleSubmit,
    control, // Needed for controlled components like Select/Checkbox
    formState: { errors },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderValidationSchema), // Validate against the order schema
    defaultValues: initialData, // Pre-populate form
  });

  // This handler simply calls the onSubmit prop passed from the parent page
  const handleFormSubmit: SubmitHandler<OrderInput> = (data) => {
    console.log("CheckoutDetailsActualForm: Submitting details:", data);
    onSubmit(data); // Trigger the parent's function (e.g., prepareCheckoutSession)
  };

  return (
    // The parent page provides the main layout, this is just the form content
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Card 1: Order Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Order Setup</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Captivity Branch (Select) */}
          <Controller
            name="captivityBranch"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <Label htmlFor="captivityBranch">Branch *</Label>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="captivityBranch">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.captivityBranch && (
                  <p className="text-sm text-red-600">
                    {errors.captivityBranch.message}
                  </p>
                )}
              </div>
            )}
          />
          {/* Method of Collection (Select) */}
          <Controller
            name="methodOfCollection"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <Label htmlFor="methodOfCollection">
                  Collection/Delivery *
                </Label>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="methodOfCollection">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionOptions.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.methodOfCollection && (
                  <p className="text-sm text-red-600">
                    {errors.methodOfCollection.message}
                  </p>
                )}
              </div>
            )}
          />
          {/* Sales Rep (Optional Input) */}
          <div className="space-y-1">
            <Label htmlFor="salesRep">Sales Rep</Label>
            <Input
              id="salesRep"
              {...register("salesRep")}
              placeholder="(Optional)"
              disabled={isSubmitting}
            />
            {errors.salesRep && (
              <p className="text-sm text-red-600">{errors.salesRep.message}</p>
            )}
          </div>
          {/* Reference Number (Optional Input) */}
          <div className="space-y-1">
            <Label htmlFor="referenceNumber">Your Reference Number</Label>
            <Input
              id="referenceNumber"
              {...register("referenceNumber")}
              placeholder="(Optional)"
              disabled={isSubmitting}
            />
            {errors.referenceNumber && (
              <p className="text-sm text-red-600">
                {errors.referenceNumber.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Billing Details */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Shipping Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Use structure similar to settings form, ensuring required fields have '*' */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="checkout-actual-firstName">First Name *</Label>
              <Input
                id="checkout-actual-firstName"
                {...register("firstName")}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkout-actual-lastName">Last Name *</Label>
              <Input
                id="checkout-actual-lastName"
                {...register("lastName")}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkout-actual-companyName">Company Name *</Label>
            <Input
              id="checkout-actual-companyName"
              {...register("companyName")}
              disabled={isSubmitting}
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">
                {errors.companyName.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkout-actual-countryRegion">
              Country / Region *
            </Label>
            {/* Consider using a Select component here for better UX */}
            <Input
              id="checkout-actual-countryRegion"
              {...register("countryRegion")}
              placeholder="e.g., South Africa"
              disabled={isSubmitting}
            />
            {errors.countryRegion && (
              <p className="text-sm text-red-600">
                {errors.countryRegion.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkout-actual-streetAddress">
              Street Address *
            </Label>
            <Input
              id="checkout-actual-streetAddress"
              placeholder="House number and street name"
              {...register("streetAddress")}
              disabled={isSubmitting}
            />
            {errors.streetAddress && (
              <p className="text-sm text-red-600">
                {errors.streetAddress.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkout-actual-apartmentSuite">
              Apartment, suite, etc.
            </Label>
            <Input
              id="checkout-actual-apartmentSuite"
              placeholder="(Optional)"
              {...register("apartmentSuite")}
              disabled={isSubmitting}
            />
            {errors.apartmentSuite && (
              <p className="text-sm text-red-600">
                {errors.apartmentSuite.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkout-actual-townCity">Town / City *</Label>
            <Input
              id="checkout-actual-townCity"
              {...register("townCity")}
              disabled={isSubmitting}
            />
            {errors.townCity && (
              <p className="text-sm text-red-600">{errors.townCity.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkout-actual-province">Province *</Label>
            {/* Consider using a Select component here */}
            <Input
              id="checkout-actual-province"
              {...register("province")}
              disabled={isSubmitting}
            />
            {errors.province && (
              <p className="text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkout-actual-postcode">Postal Code *</Label>
            <Input
              id="checkout-actual-postcode"
              {...register("postcode")}
              disabled={isSubmitting}
            />
            {errors.postcode && (
              <p className="text-sm text-red-600">{errors.postcode.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="checkout-actual-phone">Phone *</Label>
              <Input
                id="checkout-actual-phone"
                type="tel"
                {...register("phone")}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkout-actual-email">Email Address *</Label>
              <Input
                id="checkout-actual-email"
                type="email"
                {...register("email")}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label htmlFor="orderNotes">Order Notes (optional)</Label>
            <Textarea
              id="orderNotes"
              placeholder="Notes about your order, e.g. special delivery instructions."
              className="min-h-[80px]"
              {...register("orderNotes")}
              disabled={isSubmitting}
            />
            {errors.orderNotes && (
              <p className="text-sm text-red-600">
                {errors.orderNotes.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Terms & Submission */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            Your personal data will be used to process your order, support your
            experience throughout this website, and for other purposes described
            in our privacy policy.
          </p>
          {/* Agree Terms Checkbox */}
          <Controller
            name="agreeTerms"
            control={control}
            render={({ field }) => (
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                  aria-labelledby="agreeTerms-label" // For accessibility
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="agreeTerms"
                    id="agreeTerms-label"
                    className="text-sm font-medium cursor-pointer"
                  >
                    I have read and agree to the website{" "}
                    <a
                      href="/terms-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary hover:text-primary/80"
                    >
                      terms and conditions
                    </a>{" "}
                    *
                  </Label>
                  {errors.agreeTerms && (
                    <p className="text-sm font-medium text-red-600">
                      {errors.agreeTerms.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          />
          {/* Email Reviews Checkbox */}
          <Controller
            name="receiveEmailReviews"
            control={control}
            render={({ field }) => (
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="receiveEmailReviews"
                  checked={field.value ?? false} // Handle potential undefined default
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="receiveEmailReviews"
                  className="text-sm font-medium cursor-pointer"
                >
                  Request email review invitation after purchase (optional)
                </Label>
              </div>
            )}
          />
        </CardContent>
        {/* Footer belongs to the wrapping structure of the page, but button here */}
        <CardFooter>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 ml-auto"
          >
            {isSubmitting ? (
              <>
                {" "}
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                Proceeding...{" "}
              </>
            ) : (
              "Proceed to Payment Details"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CheckoutDetailsActualForm;

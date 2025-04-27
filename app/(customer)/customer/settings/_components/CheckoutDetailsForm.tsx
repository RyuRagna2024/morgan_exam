// app/(customer)/settings/_components/CheckoutDetailsForm.tsx
"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form"; // Import SubmitHandler
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { SessionUser } from "@/app/(customer)/SessionProvider";
import {
  CheckoutDetailsFormValues,
  checkoutDetailsSchema,
} from "../_actions/types";

interface CheckoutDetailsFormProps {
  user: SessionUser;
  onSubmit: (data: CheckoutDetailsFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const CheckoutDetailsForm: React.FC<CheckoutDetailsFormProps> = ({
  user,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutDetailsFormValues>({
    // <<< Use the correct type here
    resolver: zodResolver(checkoutDetailsSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      companyName: "", // Assuming companyName isn't stored on User
      country: user.country || "",
      streetAddress: user.streetAddress || "",
      // --- Map user.suburb to apartmentSuite ---
      apartmentSuite: user.suburb || "",
      // --- End Map ---
      townCity: user.townCity || "",
      province: "", // Assuming province isn't stored on User
      postcode: user.postcode || "",
      // --- Map user.phoneNumber to phone ---
      phone: user.phoneNumber || "",
      // --- End Map ---
      email: user.email || "",
    },
  });

  // Define the handler with the correct type for the data parameter
  const handleFormSubmit: SubmitHandler<CheckoutDetailsFormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Details</CardTitle>
        <CardDescription>
          Update your default billing/shipping information used during checkout.
        </CardDescription>
      </CardHeader>
      {/* Use the correctly typed handler */}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ... firstName, lastName ... */}
            <div className="space-y-1">
              <Label htmlFor="checkout-firstName">First Name</Label>
              <Input
                id="checkout-firstName"
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
              <Label htmlFor="checkout-lastName">Last Name</Label>
              <Input
                id="checkout-lastName"
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

          {/* Company Name (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="checkout-companyName">Company Name</Label>
            <Input
              id="checkout-companyName"
              {...register("companyName")}
              placeholder="(Optional)"
              disabled={isSubmitting}
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1">
            <Label htmlFor="checkout-country">Country / Region</Label>
            <Input
              id="checkout-country"
              {...register("country")}
              disabled={isSubmitting}
            />
            {errors.country && (
              <p className="text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          {/* Street Address */}
          <div className="space-y-1">
            <Label htmlFor="checkout-streetAddress">Street Address</Label>
            <Input
              id="checkout-streetAddress"
              {...register("streetAddress")}
              disabled={isSubmitting}
            />
            {errors.streetAddress && (
              <p className="text-sm text-red-600">
                {errors.streetAddress.message}
              </p>
            )}
          </div>

          {/* Apartment/Suite */}
          <div className="space-y-1">
            <Label htmlFor="checkout-apartmentSuite">
              Apartment, suite, etc.
            </Label>
            {/* Corrected register("apartmentSuite") */}
            <Input
              id="checkout-apartmentSuite"
              {...register("apartmentSuite")}
              placeholder="(Optional)"
              disabled={isSubmitting}
            />
            {errors.apartmentSuite && (
              <p className="text-sm text-red-600">
                {errors.apartmentSuite.message}
              </p>
            )}
          </div>

          {/* Town/City */}
          <div className="space-y-1">
            <Label htmlFor="checkout-townCity">Town / City</Label>
            <Input
              id="checkout-townCity"
              {...register("townCity")}
              disabled={isSubmitting}
            />
            {errors.townCity && (
              <p className="text-sm text-red-600">{errors.townCity.message}</p>
            )}
          </div>

          {/* Province */}
          <div className="space-y-1">
            <Label htmlFor="checkout-province">Province</Label>
            <Input
              id="checkout-province"
              {...register("province")}
              disabled={isSubmitting}
            />
            {errors.province && (
              <p className="text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>

          {/* Postcode */}
          <div className="space-y-1">
            <Label htmlFor="checkout-postcode">Postcode</Label>
            <Input
              id="checkout-postcode"
              {...register("postcode")}
              disabled={isSubmitting}
            />
            {errors.postcode && (
              <p className="text-sm text-red-600">{errors.postcode.message}</p>
            )}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="checkout-phone">Phone</Label>
              {/* Corrected register("phone") */}
              <Input
                id="checkout-phone"
                type="tel"
                {...register("phone")}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkout-email">Email Address</Label>
              <Input
                id="checkout-email"
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
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating
                Details...
              </>
            ) : (
              "Update Details"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CheckoutDetailsForm;

// app/(customer)/settings/_components/CheckoutDetailsForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
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
  // User object containing the relevant fields
  user: SessionUser & {
    // Add fields explicitly if not guaranteed by SessionUser
    streetAddress?: string | null;
    suburb?: string | null;
    townCity?: string | null;
  };
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
    resolver: zodResolver(checkoutDetailsSchema),
    // Pre-populate using User model fields
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      country: user.country || "", // Maps to Order.countryRegion label
      streetAddress: user.streetAddress || "",
      suburb: user.suburb || "", // Maps to Order.apartmentSuite label
      townCity: user.townCity || "",
      postcode: user.postcode || "",
      phoneNumber: user.phoneNumber || "", // Maps to Order.phone label
      email: user.email || "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Details</CardTitle>
        <CardDescription>
          Update your default billing/shipping information used during checkout.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Apartment/Suite (using Suburb field) */}
          <div className="space-y-1">
            <Label htmlFor="checkout-suburb">Apartment, suite, etc.</Label>
            <Input
              id="checkout-suburb"
              {...register("suburb")}
              placeholder="(Optional)"
              disabled={isSubmitting}
            />
            {errors.suburb && (
              <p className="text-sm text-red-600">{errors.suburb.message}</p>
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
              <Label htmlFor="checkout-phoneNumber">Phone</Label>
              <Input
                id="checkout-phoneNumber"
                type="tel"
                {...register("phoneNumber")}
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
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
          {/* Note: Company Name & Province cannot be set here */}
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

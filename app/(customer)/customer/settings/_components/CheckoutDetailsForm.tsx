// app/(customer)/settings/_components/CheckoutDetailsForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { toast } from "react-hot-toast"; // Or use sonner

// Import Actions and Types using the new names
import { getCheckoutPreferences } from "../_actions/actions";
import {
  CheckoutPreferenceFormValues,
  checkoutPreferenceSchema,
} from "../_actions/types";
import type { UserCheckoutPreference } from "@prisma/client"; // Import model type

interface CheckoutDetailsFormProps {
  // No longer needs user prop
  onSubmit: (data: CheckoutPreferenceFormValues) => Promise<void>; // Parent's submit handler
  isSubmitting: boolean; // Controlled by parent page state
}

const CheckoutDetailsForm: React.FC<CheckoutDetailsFormProps> = ({
  onSubmit,
  isSubmitting, // Use prop for button state
}) => {
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [errorPrefs, setErrorPrefs] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset, // Use reset to populate form after fetch
    formState: { errors },
  } = useForm<CheckoutPreferenceFormValues>({
    resolver: zodResolver(checkoutPreferenceSchema),
    defaultValues: {}, // Initialize empty, reset will populate
  });

  // Fetch preferences on component mount
  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      setIsLoadingPrefs(true);
      setErrorPrefs(null);
      try {
        const { preference, error } = await getCheckoutPreferences();
        if (!isMounted) return;

        if (error) {
          setErrorPrefs(error);
          toast.error(`Error loading preferences: ${error}`);
        } else {
          // Reset form with fetched data (or empty strings if preference is null/field is null)
          reset({
            firstName: preference?.firstName ?? "",
            lastName: preference?.lastName ?? "",
            companyName: preference?.companyName ?? "",
            countryRegion: preference?.countryRegion ?? "", // Use correct field name
            streetAddress: preference?.streetAddress ?? "",
            apartmentSuite: preference?.apartmentSuite ?? "",
            townCity: preference?.townCity ?? "",
            province: preference?.province ?? "",
            postcode: preference?.postcode ?? "",
            phone: preference?.phone ?? "",
            email: preference?.email ?? "",
          });
        }
      } catch (fetchError) {
        if (isMounted) {
          setErrorPrefs("Failed to load data.");
          toast.error("Failed loading preferences data.");
          console.error("Error fetching preferences:", fetchError);
        }
      } finally {
        if (isMounted) setIsLoadingPrefs(false);
      }
    };
    loadPreferences();
    return () => {
      isMounted = false;
    }; // Cleanup
  }, [reset]);

  // Calls the parent's submit handler
  const handleFormSubmit: SubmitHandler<CheckoutPreferenceFormValues> = (
    data,
  ) => {
    // Convert empty strings back to null before submitting, as schema allows null
    const dataToSubmit = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ]),
    );
    onSubmit(dataToSubmit as CheckoutPreferenceFormValues);
  };

  // --- Render Logic ---
  if (isLoadingPrefs) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />{" "}
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add more skeletons to better match form fields */}
          <Skeleton className="h-10 w-full" />{" "}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />{" "}
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          {" "}
          <Skeleton className="h-10 w-24 ml-auto" />{" "}
        </CardFooter>
      </Card>
    );
  }

  if (errorPrefs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{errorPrefs}</p>
        </CardContent>
      </Card>
    );
  }

  // Actual Form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Preferences</CardTitle>
        <CardDescription>
          Update your default billing/shipping details. Leave fields blank if
          you don&apos;t want a preference.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="checkout-pref-firstName">First Name</Label>
              <Input
                id="checkout-pref-firstName"
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
              <Label htmlFor="checkout-pref-lastName">Last Name</Label>
              <Input
                id="checkout-pref-lastName"
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
          {/* Company Name */}
          <div className="space-y-1">
            <Label htmlFor="checkout-pref-companyName">Company Name</Label>
            <Input
              id="checkout-pref-companyName"
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
          {/* <<< Use 'countryRegion' to match schema >>> */}
          <div className="space-y-1">
            <Label htmlFor="checkout-pref-countryRegion">
              Country / Region
            </Label>
            <Input
              id="checkout-pref-countryRegion"
              {...register("countryRegion")}
              disabled={isSubmitting}
            />
            {errors.countryRegion && (
              <p className="text-sm text-red-600">
                {errors.countryRegion.message}
              </p>
            )}
          </div>
          {/* Street Address */}
          <div className="space-y-1">
            <Label htmlFor="checkout-pref-streetAddress">Street Address</Label>
            <Input
              id="checkout-pref-streetAddress"
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
            <Label htmlFor="checkout-pref-apartmentSuite">
              Apartment, suite, etc.
            </Label>
            <Input
              id="checkout-pref-apartmentSuite"
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
            <Label htmlFor="checkout-pref-townCity">Town / City</Label>
            <Input
              id="checkout-pref-townCity"
              {...register("townCity")}
              disabled={isSubmitting}
            />
            {errors.townCity && (
              <p className="text-sm text-red-600">{errors.townCity.message}</p>
            )}
          </div>
          {/* Province */}
          <div className="space-y-1">
            <Label htmlFor="checkout-pref-province">Province</Label>
            <Input
              id="checkout-pref-province"
              {...register("province")}
              disabled={isSubmitting}
            />
            {errors.province && (
              <p className="text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>
          {/* Postcode */}
          <div className="space-y-1">
            <Label htmlFor="checkout-pref-postcode">Postcode</Label>
            <Input
              id="checkout-pref-postcode"
              {...register("postcode")}
              disabled={isSubmitting}
            />
            {errors.postcode && (
              <p className="text-sm text-red-600">{errors.postcode.message}</p>
            )}
          </div>
          {/* <<< Use 'phone' to match schema >>> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="checkout-pref-phone">Phone</Label>
              <Input
                id="checkout-pref-phone"
                type="tel"
                {...register("phone")}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            {/* <<< Use 'email' to match schema >>> */}
            <div className="space-y-1">
              <Label htmlFor="checkout-pref-email">Email Address</Label>
              <Input
                id="checkout-pref-email"
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
                {" "}
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                Prefs...{" "}
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CheckoutDetailsForm;

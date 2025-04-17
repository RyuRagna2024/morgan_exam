// app/(customer)/settings/_components/ProfileInfoForm.tsx
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
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { SessionUser } from "@/app/(customer)/SessionProvider";
import {
  ProfileUpdateFormValues,
  profileUpdateSchema,
} from "../_actions/types";

interface ProfileInfoFormProps {
  // Adjust this type based on what's truly available in the initial user object passed
  user: SessionUser & {
    phoneNumber?: string | null;
    streetAddress?: string | null; // Use Prisma field names
    suburb?: string | null;
    townCity?: string | null;
    // stateProvince REMOVED
    postcode?: string | null; // Use Prisma field name
    // country should be in SessionUser already
  };
  onSubmit: (data: ProfileUpdateFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  user,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    // Pre-populate using Prisma field names
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      streetAddress: user.streetAddress || "", // Use streetAddress
      suburb: user.suburb || "", // Use suburb
      townCity: user.townCity || "", // Use townCity
      postcode: user.postcode || "", // Use postcode (should be in SessionUser)
      country: user.country || "", // Use country (should be in SessionUser)
      // stateProvince removed
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your account details and address.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Basic Info Section (no changes needed here if names were correct) */}
          <div className="space-y-4">
            {/* ... firstName, lastName, displayName, username, email, phoneNumber inputs ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              {/* Last Name */}
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-1">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  {...register("displayName")}
                  disabled={isSubmitting}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-600">
                    {errors.displayName.message}
                  </p>
                )}
              </div>
              {/* Username */}
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  disabled={isSubmitting}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              {/* Phone Number */}
              <div className="space-y-1">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  placeholder="(Optional)"
                  disabled={isSubmitting}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Section - Use Prisma field names */}
          <div className="space-y-4">
            <h3 className="text-md font-medium">Address</h3>
            {/* Street Address */}
            <div className="space-y-1">
              <Label htmlFor="streetAddress">Street Address</Label>{" "}
              {/* Changed label/htmlFor */}
              <Input
                id="streetAddress"
                {...register("streetAddress")}
                disabled={isSubmitting}
              />{" "}
              {/* Changed register */}
              {errors.streetAddress && (
                <p className="text-sm text-red-600">
                  {errors.streetAddress.message}
                </p>
              )}
            </div>
            {/* Suburb */}
            <div className="space-y-1">
              <Label htmlFor="suburb">Suburb / Apt / Unit #</Label>{" "}
              {/* Changed label/htmlFor */}
              <Input
                id="suburb"
                {...register("suburb")}
                placeholder="(Optional)"
                disabled={isSubmitting}
              />{" "}
              {/* Changed register */}
              {errors.suburb && (
                <p className="text-sm text-red-600">{errors.suburb.message}</p>
              )}
            </div>
            {/* Town/City & Postcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="townCity">Town / City</Label>{" "}
                {/* Changed label/htmlFor */}
                <Input
                  id="townCity"
                  {...register("townCity")}
                  disabled={isSubmitting}
                />{" "}
                {/* Changed register */}
                {errors.townCity && (
                  <p className="text-sm text-red-600">
                    {errors.townCity.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="postcode">Postcode</Label>{" "}
                {/* Changed label/htmlFor */}
                <Input
                  id="postcode"
                  {...register("postcode")}
                  disabled={isSubmitting}
                />{" "}
                {/* Changed register */}
                {errors.postcode && (
                  <p className="text-sm text-red-600">
                    {errors.postcode.message}
                  </p>
                )}
              </div>
            </div>
            {/* State/Province REMOVED */}
            {/* Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Empty div for spacing or add another field */}
              <div></div>
              <div className="space-y-1">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register("country")}
                  disabled={isSubmitting}
                />
                {errors.country && (
                  <p className="text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileInfoForm;

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
import { SessionUser } from "@/app/(customer)/SessionProvider"; // Use the shared type
import {
  ProfileUpdateFormValues,
  profileUpdateSchema,
} from "../_actions/types"; // Corrected path

interface ProfileInfoFormProps {
  user: SessionUser;
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
    // <<< Use the correct type here
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      streetAddress: user.streetAddress || "", // Now valid in schema
      suburb: user.suburb || "", // Now valid in schema
      townCity: user.townCity || "", // Now valid in schema
      postcode: user.postcode || "",
      country: user.country || "",
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
        {" "}
        {/* Pass the correct onSubmit */}
        <CardContent className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            {/* Field rows... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ... firstName, lastName ... */}
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
              {/* ... displayName, username ... */}
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
              {/* ... email, phoneNumber ... */}
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

          {/* Address Section - Use correct register names */}
          <div className="space-y-4">
            <h3 className="text-md font-medium">Address</h3>
            <div className="space-y-1">
              <Label htmlFor="streetAddress">Street Address</Label>
              {/* Corrected register("streetAddress") */}
              <Input
                id="streetAddress"
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
              <Label htmlFor="suburb">Suburb / Apt / Unit #</Label>
              {/* Corrected register("suburb") */}
              <Input
                id="suburb"
                {...register("suburb")}
                placeholder="(Optional)"
                disabled={isSubmitting}
              />
              {errors.suburb && (
                <p className="text-sm text-red-600">{errors.suburb.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="townCity">Town / City</Label>
                {/* Corrected register("townCity") */}
                <Input
                  id="townCity"
                  {...register("townCity")}
                  disabled={isSubmitting}
                />
                {errors.townCity && (
                  <p className="text-sm text-red-600">
                    {errors.townCity.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  {...register("postcode")}
                  disabled={isSubmitting}
                />
                {errors.postcode && (
                  <p className="text-sm text-red-600">
                    {errors.postcode.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div></div> {/* Spacer */}
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

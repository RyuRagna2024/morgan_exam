// app/(customer)/settings/page.tsx
"use client";

import React, { useState } from "react";

// Hooks and Context
import { useSession } from "../../SessionProvider"; // Use customer SessionProvider

// Actions and Types
import {
  updateCheckoutDetails,
  updateCustomerProfileInfo,
} from "./_actions/actions";
import {
  CheckoutDetailsFormValues,
  ProfileUpdateFormValues,
} from "./_actions/types";

// UI Components
import ProfileInfoForm from "./_components/ProfileInfoForm";
import CheckoutDetailsForm from "./_components/CheckoutDetailsForm";
import { toast } from "react-hot-toast"; // Or use sonner
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export default function CustomerSettingsPage() {
  const { user: sessionUser, updateProfile: updateClientSessionProfile } =
    useSession();
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false); // Separate state

  // Handler for Personal Info Form
  const handleProfileInfoSubmit = async (data: ProfileUpdateFormValues) => {
    setIsSubmittingInfo(true);
    const result = await updateCustomerProfileInfo(data);
    if (result.success) {
      toast.success(result.success);
      // Update client state for relevant fields
      updateClientSessionProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        country: data.country,
        postcode: data.postcode,
      });
    } else if (result.error) {
      toast.error(result.error);
    } else {
      toast.error("An unknown error occurred while updating profile info.");
    }
    setIsSubmittingInfo(false);
  };

  // Handler for Checkout Details Form
  const handleCheckoutDetailsSubmit = async (
    data: CheckoutDetailsFormValues,
  ) => {
    setIsSubmittingCheckout(true);
    const result = await updateCheckoutDetails(data); // Call the specific action
    if (result.success) {
      toast.success(result.success);
      // Update overlapping fields in client session state if necessary
      updateClientSessionProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        country: data.country,
        postcode: data.postcode,
      });
    } else if (result.error) {
      toast.error(result.error);
    } else {
      toast.error("An unknown error occurred while updating checkout details.");
    }
    setIsSubmittingCheckout(false);
  };

  // --- Loading State ---
  if (!sessionUser) {
    // Render loading skeletons if session data isn't ready
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Skeleton for page title */}
        <Skeleton className="h-8 w-1/4 mb-6" />

        {/* Skeleton for Tabs List */}
        <Skeleton className="h-10 w-full mb-6" />

        {/* Skeleton for Tab Content (mimicking a Card structure) */}
        <div className="space-y-6">
          {" "}
          {/* Use space-y on the wrapper */}
          <Skeleton className="h-6 w-1/3 mb-2" /> {/* Card Title */}
          <Skeleton className="h-4 w-2/3 mb-6" /> {/* Card Description */}
          <div className="space-y-4 p-6 border rounded-md">
            {" "}
            {/* Mimic CardContent padding/border */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            {" "}
            {/* Mimic CardFooter */}
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  // --- Render Actual Content ---
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue="personal-info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="checkout-details">Checkout Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal-info" className="mt-6">
          <ProfileInfoForm
            user={sessionUser} // Pass loaded user data
            onSubmit={handleProfileInfoSubmit}
            isSubmitting={isSubmittingInfo}
          />
        </TabsContent>

        {/* Checkout Details Tab */}
        <TabsContent value="checkout-details" className="mt-6">
          <CheckoutDetailsForm
            user={sessionUser} // Pass loaded user data
            onSubmit={handleCheckoutDetailsSubmit}
            isSubmitting={isSubmittingCheckout}
          />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                (Password change, 2FA, etc. - implementation needed)
              </p>
            </CardContent>
            {/* Optional: Add actions/forms here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// app/(customer)/settings/page.tsx
"use client";

import React, { useState } from "react";

// Hooks and Context
import { useSession } from "../../SessionProvider";

// Actions and Types
import {
  updateCheckoutDetails,
  updateCustomerProfileInfo,
  // Removed: changePassword (handled within the form component)
} from "./_actions/actions";
import {
  CheckoutDetailsFormValues,
  ProfileUpdateFormValues,
  // Removed: PasswordChangeFormValues (handled within the form component)
} from "./_actions/types";

// UI Components
import ProfileInfoForm from "./_components/ProfileInfoForm";
import CheckoutDetailsForm from "./_components/CheckoutDetailsForm";
import PasswordChangeForm from "./_components/PasswordChangeForm"; // <<< Import the new form
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription, // Added import
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerSettingsPage() {
  const { user: sessionUser, updateProfile: updateClientSessionProfile } =
    useSession();
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  // No need for password submitting state here, form manages it

  // Handler for Personal Info Form
  const handleProfileInfoSubmit = async (data: ProfileUpdateFormValues) => {
    setIsSubmittingInfo(true);
    // ... (rest of the info submit handler) ...
    setIsSubmittingInfo(false);
  };

  // Handler for Checkout Details Form
  const handleCheckoutDetailsSubmit = async (
    data: CheckoutDetailsFormValues,
  ) => {
    setIsSubmittingCheckout(true);
    // ... (rest of the checkout submit handler) ...
    setIsSubmittingCheckout(false);
  };

  // Loading State
  if (!sessionUser) {
    // ... (keep existing skeleton loading state) ...
    return (
      // ... Skeleton JSX ...
      <div>Loading settings...</div> // Placeholder
    );
  }

  // Render Actual Content
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
            user={sessionUser}
            onSubmit={handleProfileInfoSubmit}
            isSubmitting={isSubmittingInfo}
          />
        </TabsContent>

        {/* Checkout Details Tab */}
        <TabsContent value="checkout-details" className="mt-6">
          <CheckoutDetailsForm
            user={sessionUser}
            onSubmit={handleCheckoutDetailsSubmit}
            isSubmitting={isSubmittingCheckout}
          />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          {/* --- Render the PasswordChangeForm --- */}
          <PasswordChangeForm />
          {/* --- END --- */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// app/(customer)/settings/page.tsx
"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

// Hooks and Context
// Remove SessionContext from import, keep SessionUser if needed elsewhere, otherwise remove too
import { useSession, SessionUser } from "../../SessionProvider";

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
import PasswordChangeForm from "./_components/PasswordChangeForm";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerSettingsPage() {
  // --- REMOVE Explicit type annotation : SessionContext ---
  const { user: sessionUser, updateProfile: updateClientSessionProfile } =
    useSession(); // Let TypeScript infer the type
  // --- End Removal ---

  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const validTabs = ["personal-info", "checkout-details", "security"];
  const defaultTabValue =
    initialTab && validTabs.includes(initialTab) ? initialTab : "personal-info";

  // Handler for Personal Info Form
  const handleProfileInfoSubmit = async (data: ProfileUpdateFormValues) => {
    setIsSubmittingInfo(true);
    try {
      const result = await updateCustomerProfileInfo(data);
      if (result.success) {
        toast.success(result.success);
        if (updateClientSessionProfile) {
          // Check if function exists
          updateClientSessionProfile({
            /* ... data matching SessionUser ... */
          });
        } else {
          console.warn(
            "updateClientSessionProfile is not available in context",
          );
        }
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  // Handler for Checkout Details Form
  const handleCheckoutDetailsSubmit = async (
    data: CheckoutDetailsFormValues,
  ) => {
    setIsSubmittingCheckout(true);
    try {
      const result = await updateCheckoutDetails(data);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating checkout details:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // Loading State
  if (!sessionUser) {
    // ... Skeleton remains the same ...
    return (
      <div className="space-y-6 max-w-4xl mx-auto"> {/* Skeleton JSX */}</div>
    );
  }

  // Render Actual Content
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue={defaultTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="checkout-details">Checkout Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info" className="mt-6">
          <ProfileInfoForm
            user={sessionUser} // Pass the inferred user object
            onSubmit={handleProfileInfoSubmit}
            isSubmitting={isSubmittingInfo}
          />
        </TabsContent>

        <TabsContent value="checkout-details" className="mt-6">
          <CheckoutDetailsForm
            user={sessionUser} // Pass the inferred user object
            onSubmit={handleCheckoutDetailsSubmit}
            isSubmitting={isSubmittingCheckout}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <PasswordChangeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

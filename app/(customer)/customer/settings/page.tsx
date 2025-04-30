// app/(customer)/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react"; // Import useEffect
import { useSearchParams } from "next/navigation";
import { useSession, SessionUser } from "../../SessionProvider"; // Keep SessionUser if needed
import {
  updateCheckoutDetails,
  updateCustomerProfileInfo,
} from "./_actions/actions";
import type { ProfileUpdateActionResult } from "./_actions/actions"; // <<< Import specific result type
import {
  CheckoutDetailsFormValues,
  ProfileUpdateFormValues,
} from "./_actions/types";
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
  const { user: sessionUser, updateProfile: updateClientSessionProfile } =
    useSession();
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const validTabs = ["personal-info", "checkout-details", "security"];
  const defaultTabValue =
    initialTab && validTabs.includes(initialTab) ? initialTab : "personal-info";

  // --- State to manage the user data locally for form resets ---
  // Initialize with data from context, but allow updates
  const [currentUserData, setCurrentUserData] = useState<SessionUser | null>(
    sessionUser,
  );

  // Effect to update local state if context changes (e.g., after initial load or external update)
  useEffect(() => {
    setCurrentUserData(sessionUser);
  }, [sessionUser]);

  // Handler for Personal Info Form
  const handleProfileInfoSubmit = async (data: ProfileUpdateFormValues) => {
    if (!updateClientSessionProfile) {
      console.warn(
        "updateClientSessionProfile function is missing from context.",
      );
      toast.error("Cannot update session state.");
      return;
    }

    setIsSubmittingInfo(true);
    try {
      // <<< Expect the modified result type >>>
      const result: ProfileUpdateActionResult =
        await updateCustomerProfileInfo(data);

      if (result.success) {
        toast.success(result.success);
        if (result.updatedUser) {
          console.log("Updating client session with:", result.updatedUser);
          // Update the context state
          updateClientSessionProfile(result.updatedUser);
          // Also update the local state used by the form's key/reset mechanism
          setCurrentUserData((prev) =>
            prev ? { ...prev, ...result.updatedUser } : null,
          );
        } else {
          console.warn(
            "Profile updated successfully, but no updated user data returned from action.",
          );
          // Optionally trigger a refresh or just rely on revalidation if no data returned
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

  // Handler for Checkout Details Form (adapt if needed)
  const handleCheckoutDetailsSubmit = async (
    data: CheckoutDetailsFormValues,
  ) => {
    // Similar logic: call action, handle result, potentially update session state
    setIsSubmittingCheckout(true);
    try {
      const result = await updateCheckoutDetails(data); // Assuming it returns UpdateActionResult for now
      if (result.success) {
        toast.success(result.success);
        // If updateCheckoutDetails also returns updated user data, update session here too
        // updateClientSessionProfile({ ... relevant fields ... });
        // setCurrentUserData(prev => prev ? { ...prev, ...relevant fields... } : null);
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
  if (!currentUserData) {
    // Use local state for rendering check
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-1/4" /> {/* Title Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />{" "}
            {/* Tab List Skeleton? Or just Card Title */}
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            {/* Add more skeletons to mimic form structure */}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24 ml-auto" /> {/* Button Skeleton */}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render Actual Content
  // Use `key` prop on Forms to force re-render with new defaultValues when currentUserData changes
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
            key={`profile-${currentUserData.id}-${JSON.stringify(currentUserData)}`} // Force re-render on data change
            user={currentUserData} // Pass the *local* potentially updated user data
            onSubmit={handleProfileInfoSubmit}
            isSubmitting={isSubmittingInfo}
          />
        </TabsContent>

        <TabsContent value="checkout-details" className="mt-6">
          {/* Apply key prop here too if updating session from checkout */}
          <CheckoutDetailsForm
            key={`checkout-${currentUserData.id}-${JSON.stringify(currentUserData)}`}
            user={currentUserData} // Pass the local potentially updated user data
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

// app/(customer)/settings/page.tsx
"use client";

import React, { useState } from "react";
import ProfileInfoForm from "./_components/ProfileInfoForm";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "../../SessionProvider";
import { updateCustomerProfileInfo } from "./_actions/actions";
import { ProfileUpdateFormValues } from "./_actions/types";

export default function CustomerSettingsPage() {
  const { user: sessionUser, updateProfile: updateClientSessionProfile } =
    useSession();
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  const handleProfileInfoSubmit = async (data: ProfileUpdateFormValues) => {
    setIsSubmittingInfo(true);
    const result = await updateCustomerProfileInfo(data);

    if (result.success) {
      toast.success(result.success);
      // Update client-side session state for fields present in SessionUser
      updateClientSessionProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        username: data.username, // <<< Update username in client state
        email: data.email, // <<< Update email in client state
        phoneNumber: data.phoneNumber, // <<< Update phone in client state
        // NOTE: Address fields are NOT updated here as they aren't in SessionUser
      });
    } else if (result.error) {
      toast.error(result.error);
    } else {
      toast.error("An unknown error occurred while updating profile info.");
    }
    setIsSubmittingInfo(false);
  };

  if (!sessionUser) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p>Loading user settings...</p>
      </div>
    );
  }

  // --- IMPORTANT: Prepare user prop for ProfileInfoForm ---
  // Since ProfileInfoForm expects address fields etc, but sessionUser might not have them ALL YET
  // (they come from the full DB user initially), we might need to fetch the full user here
  // OR ensure the initial SessionUser passed from the LAYOUT includes these fields.
  // For now, assuming sessionUser *might* have them (if added in layout/SessionProvider)
  // A safer approach might be fetching full user details on this page with useEffect.
  // However, we proceed assuming `sessionUser` has the needed fields for pre-population.

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue="personal-info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="checkout-details">Checkout Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info" className="mt-6">
          {/* Pass sessionUser which should contain the necessary fields for pre-population */}
          <ProfileInfoForm
            user={sessionUser} // Pass the user object from useSession
            onSubmit={handleProfileInfoSubmit}
            isSubmitting={isSubmittingInfo}
          />
        </TabsContent>

        {/* Other Tabs remain the same */}
        <TabsContent value="checkout-details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Checkout Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">(Address management...)</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">(Password change...)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// app/(customer)/subscriptions/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import TierApplicationForm from "./_components/TierApplicationForm";
import { Metadata } from "next";
import { getUserTierStatus } from "./_actions/fetch-tier-status";
import CurrentTierStatus from "./_components/CurrentTierStatus";
import { getAppliedTier } from "./_actions/get-applied-tier";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Import Card components

export const metadata: Metadata = {
  title: "Membership Tier | Customer Dashboard",
  description:
    "View your current tier status and apply for higher membership tiers",
};
export const dynamic = "force-dynamic";

export default async function TierApplicationPage() {
  const [tierStatusResult, appliedTierResult] = await Promise.all([
    getUserTierStatus(),
    getAppliedTier(),
  ]);

  // Handle loading error
  if (!tierStatusResult.success) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {" "}
        {/* Added space-y */}
        <Card className="border-destructive">
          {" "}
          {/* Use destructive border */}
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>{" "}
            {/* Use destructive text */}
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {" "}
              {/* Use destructive text */}
              Failed to load tier status. Please refresh the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user name safely
  const userName =
    tierStatusResult.user?.displayName ||
    tierStatusResult.user?.firstName ||
    "Valued Customer";

  return (
    // Use semantic colors for page text
    <div className="max-w-3xl mx-auto space-y-8 text-foreground">
      {/* Page Header */}
      <div className="mb-0">
        {" "}
        {/* Removed bottom margin, handled by space-y */}
        <h1 className="text-3xl font-bold">Membership Tier Status</h1>
        <p className="text-muted-foreground mt-2">
          View your current tier benefits and apply for higher membership
          levels.
        </p>
      </div>

      {/* Current Status Card */}
      {/* Use Card component for structure and background */}
      <Card>
        <CardHeader>
          {/* Moved title inside CardHeader */}
          <CardTitle className="text-xl">Current Membership Status</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentTierStatus
            currentTier={tierStatusResult.currentTier}
            userName={userName}
            latestApplication={tierStatusResult.latestApplication}
          />
        </CardContent>
      </Card>

      {/* Application Section (Conditional) */}
      {tierStatusResult.currentTier !== "PLATINUM" && (
        <Card>
          <CardHeader>
            <CardTitle>Apply for a Higher Tier</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pending Application Notice */}
            {tierStatusResult.latestApplication && (
              // Use theme-aware colors
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 rounded-md p-4 mb-6 text-sm">
                <strong>Note:</strong> You have a pending application for the{" "}
                {tierStatusResult.latestApplication.package} tier. Submitting a
                new application will replace the current one.
              </div>
            )}
            {/* Tier Application Form */}
            <TierApplicationForm
              currentTier={tierStatusResult.currentTier}
              lastAppliedTier={appliedTierResult.appliedTier || undefined}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

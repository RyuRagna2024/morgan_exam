import React from "react";
import TierApplicationForm from "./_components/TierApplicationForm";
import { Metadata } from "next";
import { getUserTierStatus } from "./_actions/fetch-tier-status";
import CurrentTierStatus from "./_components/CurrentTierStatus";
import { getAppliedTier } from "./_actions/get-applied-tier";

export const metadata: Metadata = {
  title: "Membership Tier | Customer Dashboard",
  description:
    "View your current tier status and apply for higher membership tiers",
};

// Make the page dynamic to ensure fresh data on each request
export const dynamic = "force-dynamic";

export default async function TierApplicationPage() {
  // Fetch data in parallel
  const [tierStatusResult, appliedTierResult] = await Promise.all([
    getUserTierStatus(),
    getAppliedTier(),
  ]);

  if (!tierStatusResult.success) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-500">
            Failed to load tier status. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Membership Tier Status
        </h1>
        <p className="text-gray-600 mt-2">
          View your current tier benefits and apply for higher membership levels
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <CurrentTierStatus
          currentTier={tierStatusResult.currentTier}
          userName={
            tierStatusResult.user.displayName || tierStatusResult.user.firstName
          }
          latestApplication={tierStatusResult.latestApplication}
        />
      </div>

      {tierStatusResult.currentTier !== "PLATINUM" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Apply for a Higher Tier
          </h2>

          {/* Only show the pending application notice if there is actually a pending application */}
          {tierStatusResult.latestApplication && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You already have a pending application
                for {tierStatusResult.latestApplication.package} tier. You can
                still submit a new application which will replace your current
                one.
              </p>
            </div>
          )}

          <TierApplicationForm
            currentTier={tierStatusResult.currentTier}
            lastAppliedTier={appliedTierResult.appliedTier || undefined}
          />
        </div>
      )}
    </div>
  );
}

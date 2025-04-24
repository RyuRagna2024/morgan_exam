// app/(customer)/subscriptions/_components/CurrentTierStatus.tsx
"use client";

import React from "react";
import { Medal, Clock, ArrowRight } from "lucide-react";

type CurrentTierStatusProps = {
  currentTier: string;
  userName?: string;
  latestApplication: { id: string; package: string; createdAt: Date } | null;
};

// Tier information mapping with dark mode variants
const TIER_DETAILS = {
  BRONZE: {
    title: "Bronze Tier",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/40", // Use opacity for dark background
    borderColor: "border-amber-300 dark:border-amber-700",
    benefits: [
      /* ... */
    ],
  },
  SILVER: {
    title: "Silver Tier",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-700/40",
    borderColor: "border-gray-300 dark:border-gray-600",
    benefits: [
      /* ... */
    ],
  },
  GOLD: {
    title: "Gold Tier",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
    borderColor: "border-yellow-300 dark:border-yellow-700",
    benefits: [
      /* ... */
    ],
  },
  PLATINUM: {
    title: "Platinum Tier",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
    borderColor: "border-blue-300 dark:border-blue-700",
    benefits: [
      /* ... */
    ],
  },
};

export default function CurrentTierStatus({
  currentTier,
  userName,
  latestApplication,
}: CurrentTierStatusProps) {
  const safeCurrentTier = currentTier as keyof typeof TIER_DETAILS; // Type assertion
  const tierDetails = TIER_DETAILS[safeCurrentTier] || TIER_DETAILS.BRONZE; // Fallback

  const formattedDate = latestApplication
    ? new Date(latestApplication.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const safeAppliedPackage =
    latestApplication?.package as keyof typeof TIER_DETAILS;
  const appliedTierDetails = latestApplication
    ? TIER_DETAILS[safeAppliedPackage]
    : null;

  return (
    // Removed outer div as CardContent provides padding
    <>
      <div className="flex items-start justify-between mb-4">
        {" "}
        {/* Adjusted structure slightly */}
        <div>
          {/* Use semantic colors */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground">
              Hello, {userName || "Customer"}
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium text-foreground">
              Your current tier:
            </span>
          </div>
        </div>
      </div>

      {/* Current Tier Display */}
      <div
        className={`flex items-center p-4 rounded-lg border mb-6 ${tierDetails.bgColor} ${tierDetails.borderColor}`}
      >
        <Medal
          className={`w-10 h-10 sm:w-12 sm:h-12 mr-4 flex-shrink-0 ${tierDetails.color}`}
        />
        <div>
          <h3 className={`text-lg font-semibold ${tierDetails.color}`}>
            {tierDetails.title}
          </h3>
          <p className="text-sm text-foreground/90 dark:text-foreground/80">
            Enjoy your exclusive benefits
          </p>
        </div>
      </div>

      {/* Current Benefits */}
      <div className="mb-6">
        <h3 className="font-medium mb-2 text-foreground">
          Your Current Benefits:
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
          {tierDetails.benefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-center text-sm text-muted-foreground"
            >
              {/* Use theme primary/success color for checkmark */}
              <span className="text-primary dark:text-primary mr-2">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pending Application */}
      {latestApplication && appliedTierDetails && (
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-primary dark:text-primary mr-2" />{" "}
            {/* Use primary color */}
            <h3 className="font-semibold text-foreground">
              Pending Application
            </h3>
          </div>

          <div className="flex items-center gap-3 mb-2">
            {/* Current Tier Icon */}
            <div
              className={`p-2 rounded-lg ${TIER_DETAILS[safeCurrentTier]?.bgColor || TIER_DETAILS.BRONZE.bgColor}`}
            >
              <Medal
                className={`w-6 h-6 ${TIER_DETAILS[safeCurrentTier]?.color || TIER_DETAILS.BRONZE.color}`}
              />
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            {/* Applied Tier Icon */}
            <div className={`p-2 rounded-lg ${appliedTierDetails.bgColor}`}>
              <Medal className={`w-6 h-6 ${appliedTierDetails.color}`} />
            </div>
            {/* Text */}
            <div>
              <p className="font-medium text-foreground">
                {appliedTierDetails.title}
              </p>
              <p className="text-sm text-muted-foreground">
                Applied on {formattedDate}
              </p>
            </div>
          </div>

          {/* Notification Box */}
          <p className="text-sm bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 p-3 rounded mt-4">
            Your application is under review (typically 2-3 business days).
            We&apos;ll notify you once processed.
          </p>
        </div>
      )}
    </>
  );
}

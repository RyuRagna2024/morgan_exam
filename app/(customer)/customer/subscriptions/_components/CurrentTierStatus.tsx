"use client";

import React from "react";
import { Medal, Clock, ArrowRight } from "lucide-react";

// Types for the component props
type CurrentTierStatusProps = {
  currentTier: string;
  userName?: string; // Make userName optional
  latestApplication: {
    id: string;
    package: string;
    createdAt: Date;
  } | null;
};

// Tier information mapping
const TIER_DETAILS = {
  BRONZE: {
    title: "Bronze Tier",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-500",
    benefits: [
      "Standard shopping experience",
      "Access to regular promotions",
      "Regular customer support",
    ],
  },
  SILVER: {
    title: "Silver Tier",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-500",
    benefits: [
      "Early access to sales",
      "5% discount on all purchases",
      "Free standard shipping",
      "Priority customer support",
    ],
  },
  GOLD: {
    title: "Gold Tier",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-500",
    benefits: [
      "10% discount on all purchases",
      "Free express shipping",
      "Exclusive access to limited editions",
      "VIP customer support",
      "First access to new collections",
    ],
  },
  PLATINUM: {
    title: "Platinum Tier",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-500",
    benefits: [
      "15% discount on all purchases",
      "Dedicated personal shopper",
      "VIP events and pre-releases",
      "Free returns and exchanges",
      "Complimentary gift wrapping",
      "Exclusive platinum-only products",
    ],
  },
};

export default function CurrentTierStatus({
  currentTier,
  userName,
  latestApplication,
}: CurrentTierStatusProps) {
  // Get current tier details
  const tierDetails = TIER_DETAILS[currentTier as keyof typeof TIER_DETAILS];

  // Format application date if exists
  const formattedDate = latestApplication
    ? new Date(latestApplication.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Get applied for tier details if application exists
  const appliedTierDetails = latestApplication
    ? TIER_DETAILS[latestApplication.package as keyof typeof TIER_DETAILS]
    : null;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Current Membership Status
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-medium text-gray-700">
              Hello, {userName || "Customer"}
            </span>
            <span className="text-gray-500">|</span>
            <span className="font-medium">Your current tier:</span>
          </div>
        </div>
      </div>

      {/* Current Tier Display */}
      <div
        className={`flex items-center p-4 rounded-lg ${tierDetails.bgColor} ${tierDetails.borderColor} border mb-6`}
      >
        <Medal className={`w-12 h-12 mr-4 ${tierDetails.color}`} />
        <div>
          <h3 className="text-lg font-semibold">{tierDetails.title}</h3>
          <p className="text-gray-700">Enjoy your exclusive benefits</p>
        </div>
      </div>

      {/* Current Benefits */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Your Current Benefits:</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {tierDetails.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pending Application */}
      {latestApplication && appliedTierDetails && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-semibold">Pending Application</h3>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-3 rounded-lg ${TIER_DETAILS[currentTier as keyof typeof TIER_DETAILS].bgColor}`}
            >
              <Medal
                className={`w-6 h-6 ${TIER_DETAILS[currentTier as keyof typeof TIER_DETAILS].color}`}
              />
            </div>

            <ArrowRight className="w-5 h-5 text-gray-400" />

            <div className={`p-3 rounded-lg ${appliedTierDetails.bgColor}`}>
              <Medal className={`w-6 h-6 ${appliedTierDetails.color}`} />
            </div>

            <div>
              <p className="font-medium">{appliedTierDetails.title}</p>
              <p className="text-sm text-gray-600">
                Application submitted on {formattedDate}
              </p>
            </div>
          </div>

          <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200 mt-4">
            Your application is currently under review. This process typically
            takes 2-3 business days. We will notify you once your application
            has been processed.
          </p>
        </div>
      )}
    </div>
  );
}

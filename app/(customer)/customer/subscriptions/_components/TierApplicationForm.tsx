"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Medal } from "lucide-react";
import { TierApplicationFormData, TierPackage } from "../types";
import { tierApplicationSchema } from "../validations";
import { submitTierApplication } from "../_actions/actions";

// Types for the component props
type TierApplicationFormProps = {
  currentTier: string;
  lastAppliedTier?: string;
};

// Tier package information with visual styling
const TIER_INFO = {
  SILVER: {
    title: "Silver Tier",
    benefits: [
      "Early access to sales",
      "5% discount on all purchases",
      "Free standard shipping",
    ],
    description: "Perfect for regular shoppers looking for added value.",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-500",
  },
  GOLD: {
    title: "Gold Tier",
    benefits: [
      "10% discount on all purchases",
      "Priority customer service",
      "Free express shipping",
      "Exclusive access to limited editions",
    ],
    description: "Ideal for frequent shoppers who appreciate premium service.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-500",
  },
  PLATINUM: {
    title: "Platinum Tier",
    benefits: [
      "15% discount on all purchases",
      "Dedicated personal shopper",
      "VIP events and pre-releases",
      "Free returns and exchanges",
      "Complimentary gift wrapping",
    ],
    description:
      "The ultimate shopping experience for our most valued customers.",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-500",
  },
};

export default function TierApplicationForm({
  currentTier,
  lastAppliedTier,
}: TierApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep track of the selected tier locally
  const [selectedTier, setSelectedTier] = useState<TierPackage | undefined>(
    lastAppliedTier as TierPackage | undefined,
  );

  // Initialize the form
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TierApplicationFormData>({
    resolver: zodResolver(tierApplicationSchema),
    defaultValues: {
      package: selectedTier,
    },
  });

  // Filter available tiers based on current tier
  const availableTiers = Object.entries(TIER_INFO)
    .filter(([tierKey]) => {
      // Convert to array of tiers for comparison
      const tierOrder = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
      const currentIndex = tierOrder.indexOf(currentTier);
      const tierIndex = tierOrder.indexOf(tierKey);

      // Only show tiers higher than current tier
      return tierIndex > currentIndex;
    })
    .reduce(
      (acc, [key, value]) => {
        acc[key as TierPackage] = value;
        return acc;
      },
      {} as typeof TIER_INFO,
    );

  // Make sure we set the form value when component mounts or lastAppliedTier changes
  useEffect(() => {
    if (lastAppliedTier) {
      setSelectedTier(lastAppliedTier as TierPackage);
      setValue("package", lastAppliedTier as TierPackage);
    }
  }, [lastAppliedTier, setValue]);

  // Track the watch value and update selectedTier when it changes through form interactions
  const watchPackage = watch("package");
  useEffect(() => {
    if (watchPackage && watchPackage !== selectedTier) {
      setSelectedTier(watchPackage);
    }
  }, [watchPackage, selectedTier]);

  const onSelectTier = (tier: TierPackage) => {
    setSelectedTier(tier);
    setValue("package", tier);
  };

  const onSubmit = async (data: TierApplicationFormData) => {
    setIsSubmitting(true);

    try {
      const result = await submitTierApplication(data);

      if (result.success) {
        toast.success(result.message);
        // Refresh the page to update the tier status display
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract form rendering to a function to avoid code duplication
  const renderApplicationForm = () => {
    // Show the application form if there are available tiers
    if (Object.keys(availableTiers).length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600">
            You have reached our highest tier! Enjoy all the exclusive benefits
            of your current membership.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(availableTiers).map(([tier, info]) => (
              <div
                key={tier}
                onClick={() => onSelectTier(tier as TierPackage)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === tier
                    ? `${info.borderColor} ${info.bgColor} shadow-md`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center mb-3">
                  <input
                    type="radio"
                    name="tierPackage"
                    id={`tier-${tier}`}
                    checked={selectedTier === tier}
                    onChange={() => onSelectTier(tier as TierPackage)}
                    className="h-4 w-4 text-teal-500 focus:ring-teal-400"
                  />
                  <label
                    htmlFor={`tier-${tier}`}
                    className="ml-2 font-medium text-gray-800"
                  >
                    {info.title}
                  </label>
                </div>

                <div className="flex justify-center my-3">
                  <Medal className={`w-8 h-8 ${info.color}`} />
                </div>

                <p className="text-sm text-gray-600 mb-2">{info.description}</p>

                <ul className="text-sm space-y-1 mt-3">
                  {info.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {errors.package && (
            <p className="text-red-500 text-sm mt-2">
              {errors.package.message}
            </p>
          )}
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-gray-600 mb-4">
            By submitting this application, your account will be reviewed for
            eligibility for the selected tier. This process typically takes 2-3
            business days.
          </p>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !selectedTier}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Submitting..."
                : lastAppliedTier
                  ? "Update Application"
                  : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show application status if there's a latest application
  if (lastAppliedTier) {
    const tierInfo = TIER_INFO[lastAppliedTier as keyof typeof TIER_INFO];

    // If we don't have tier info for this package, it might be the current tier
    if (!tierInfo) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600">
            No higher tiers available. You have reached our highest tier!
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-8">
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-full ${tierInfo.bgColor} mr-3`}>
              <Medal className={`w-6 h-6 ${tierInfo.color}`} />
            </div>
            <h3 className="font-medium">Current Application Status</h3>
          </div>

          <p className="text-sm text-blue-800 mb-2">
            You have applied for the <strong>{tierInfo.title}</strong>. Your
            application is currently under review.
          </p>

          <p className="text-sm text-blue-800">
            This process typically takes 2-3 business days. You will receive a
            notification once your application has been processed.
          </p>
        </div>

        <h3 className="text-lg font-medium mb-4">Change Your Application</h3>
        <p className="text-sm text-gray-600 mb-6">
          If you wish to modify your application to a different tier, you can
          select a new tier below. This will replace your current application.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>{renderApplicationForm()}</form>
      </div>
    );
  }

  // Main render for new applications
  return (
    <form onSubmit={handleSubmit(onSubmit)}>{renderApplicationForm()}</form>
  );
}

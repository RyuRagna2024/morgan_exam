// app/(customer)/subscriptions/_components/TierApplicationForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form"; // Removed Controller, not needed for RadioGroup with FormField
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Medal, Loader2 } from "lucide-react";
import { TierApplicationFormData, TierPackage } from "../types";
import { tierApplicationSchema } from "../validations";
import { submitTierApplication } from "../_actions/actions";
// Import necessary components
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type TierApplicationFormProps = {
  currentTier: string;
  lastAppliedTier?: string;
};

// Tier info with DARK MODE variants
const TIER_INFO = {
  SILVER: {
    title: "Silver Tier",
    benefits: [
      "Early access to sales",
      "5% discount on all purchases",
      "Free standard shipping",
    ],
    description: "...",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
    borderColor: "border-gray-300 dark:border-gray-700",
    hoverBorderColor: "hover:border-gray-400 dark:hover:border-gray-500",
    selectedBorderColor: "border-primary dark:border-primary",
    selectedBgColor: "bg-primary/10 dark:bg-primary/20",
  },
  GOLD: {
    title: "Gold Tier",
    benefits: [
      "10% discount on all purchases",
      "Priority customer service",
      "Free express shipping",
      "Exclusive access to limited editions",
    ],
    description: "...",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
    borderColor: "border-yellow-400 dark:border-yellow-700",
    hoverBorderColor: "hover:border-yellow-500 dark:hover:border-yellow-600",
    selectedBorderColor: "border-primary dark:border-primary",
    selectedBgColor: "bg-primary/10 dark:bg-primary/20",
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
    description: "...",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
    borderColor: "border-blue-400 dark:border-blue-700",
    hoverBorderColor: "hover:border-blue-500 dark:hover:border-blue-600",
    selectedBorderColor: "border-primary dark:border-primary",
    selectedBgColor: "bg-primary/10 dark:bg-primary/20",
  },
};

export default function TierApplicationForm({
  currentTier,
  lastAppliedTier,
}: TierApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TierApplicationFormData>({
    resolver: zodResolver(tierApplicationSchema),
    defaultValues: { package: lastAppliedTier as TierPackage | undefined },
  });

  const watchedPackage = form.watch("package");

  const availableTiers = Object.entries(TIER_INFO) /* ... filter logic ... */
    .filter(([tierKey]) => {
      const tierOrder = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
      const currentIndex = tierOrder.indexOf(currentTier);
      const tierIndex = tierOrder.indexOf(tierKey);
      return tierIndex > currentIndex;
    })
    .reduce(
      (acc, [key, value]) => {
        acc[key as TierPackage] = value;
        return acc;
      },
      {} as typeof TIER_INFO,
    );

  useEffect(() => {
    form.reset({ package: lastAppliedTier as TierPackage | undefined });
  }, [lastAppliedTier, form]);

  const onSubmit = async (data: TierApplicationFormData) => {
    /* ... submit logic ... */
    setIsSubmitting(true);
    try {
      const result = await submitTierApplication(data);
      if (result.success) {
        toast.success(result.message);
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

  // Render function for the form content
  const renderApplicationForm = () => {
    if (Object.keys(availableTiers).length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          Highest tier reached!
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* --- CORRECTED FormField Structure for RadioGroup --- */}
        <FormField
          control={form.control}
          name="package"
          render={({ field }) => (
            <FormItem className="space-y-3">
              {" "}
              {/* Add space below label if using one */}
              {/* Optional: Add a general label for the group */}
              {/* <FormLabel className="text-base font-semibold">Select Tier</FormLabel> */}
              <FormControl>
                {/* RadioGroup receives value and onChange from 'field' */}
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4" // Grid layout for options
                >
                  {/* Map directly inside RadioGroup */}
                  {Object.entries(availableTiers).map(([tierKey, info]) => (
                    // Each option is wrapped in a div + Label for layout and clickability
                    <div key={tierKey}>
                      {/* Label associates text/content with the RadioGroupItem */}
                      <Label
                        htmlFor={`tier-${tierKey}`}
                        className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center text-center h-full", // h-full for equal height cards
                          "hover:shadow-md",
                          field.value === tierKey // Check selection against RHF field value
                            ? `${info.selectedBorderColor} ${info.selectedBgColor} ring-2 ring-primary/50 dark:ring-primary/50`
                            : `${info.borderColor} ${info.hoverBorderColor} dark:bg-card hover:bg-accent/50 dark:hover:bg-muted/50`, // Adjusted hover background
                        )}
                      >
                        {/* Actual Radio Input (Visually Hidden) */}
                        <FormControl>
                          {/* This needs to be inside a FormControl according to shadcn FormField structure */}
                          <RadioGroupItem
                            value={tierKey}
                            id={`tier-${tierKey}`}
                            className="sr-only"
                            aria-label={info.title}
                          />
                        </FormControl>
                        {/* Tier Info Display */}
                        <span
                          className={cn(
                            "font-semibold text-lg mb-2",
                            info.color,
                          )}
                        >
                          {info.title}
                        </span>
                        <Medal className={cn("w-10 h-10 my-3", info.color)} />
                        <p className="text-sm text-muted-foreground mb-3 flex-grow">
                          {info.description}
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1 text-left w-full">
                          {info.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary mr-2 pt-0.5">
                                ✓
                              </span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              {/* Message for the entire group */}
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- End CORRECTED FormField Structure --- */}

        {/* --- Submission Area --- */}
        <div className="border-t border-border pt-6 mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            {" "}
            Submitting will initiate a review...{" "}
          </p>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !watchedPackage}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting
                ? "Submitting..."
                : lastAppliedTier
                  ? "Update Application"
                  : "Submit Application"}
            </Button>
          </div>
        </div>
        {/* --- End Submission Area --- */}
      </div> // Closing div for the space-y-6 container
    );
  };

  // --- Display Logic for existing application ---
  if (lastAppliedTier) {
    const tierInfo = TIER_INFO[lastAppliedTier as keyof typeof TIER_INFO];
    if (!tierInfo) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          {" "}
          Highest tier reached!{" "}
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {/* Status box */}
        <div className="bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 p-4 rounded-lg mb-0">
          {/* ... status content ... */}
          <div className="flex items-center mb-2">
            <div className={`p-1 rounded-full ${tierInfo.bgColor} mr-2`}>
              {" "}
              <Medal className={`w-5 h-5 ${tierInfo.color}`} />{" "}
            </div>
            <h3 className="font-medium">Current Application Status</h3>
          </div>
          <p className="text-sm mb-1">
            {" "}
            You applied for <strong>{tierInfo.title}</strong>. Review takes 2-3
            business days.{" "}
          </p>
        </div>
        <h3 className="text-lg font-semibold pt-4">Change Your Application</h3>
        <p className="text-sm text-muted-foreground mb-0">
          {" "}
          Select a different tier below to replace your current
          application.{" "}
        </p>
        {/* Wrap form rendering in Form component */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            {renderApplicationForm()}
          </form>
        </Form>
      </div>
    );
  }

  // Default render for new applications
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
        {renderApplicationForm()}
      </form>
    </Form>
  );
}

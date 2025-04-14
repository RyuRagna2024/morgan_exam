import { z } from "zod";
import { TierPackage } from "./types";

/**
 * Zod validation schema for tier application form
 */
export const tierApplicationSchema = z.object({
  package: z.enum(
    [TierPackage.SILVER, TierPackage.GOLD, TierPackage.PLATINUM],
    {
      required_error: "Please select a tier package",
    },
  ),
});

/**
 * Helper function to validate tier application form data
 * @param data The form data to validate
 * @returns The validated data or throws an error
 */
export function validateTierApplication(data: unknown) {
  return tierApplicationSchema.parse(data);
}

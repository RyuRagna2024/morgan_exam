/**
 * Enum representing the available tier packages
 */
export enum TierPackage {
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

/**
 * Type definition for the tier application form data
 */
export type TierApplicationFormData = {
  package: TierPackage;
};

/**
 * Type for the response after submitting a tier application
 */
export type TierApplicationResponse = {
  success: boolean;
  application?: {
    id: string;
    package: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  message: string;
};

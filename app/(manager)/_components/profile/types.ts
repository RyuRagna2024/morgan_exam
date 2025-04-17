// app/(manager)/_components/profile/types.ts
import * as z from "zod";

// Schema for updating basic profile information
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  displayName: z.string().min(1, "Display name is required").max(50),
  // Add other editable fields as needed (e.g., phoneNumber)
});

// Type derived from the schema
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// General User type definition (can be simplified if SessionUser is always used)
export interface UserProfileData {
  id: string;
  username?: string; // Keep if needed
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string; // Keep if needed
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  role?: string; // Keep if needed
  // Add other fields displayed or edited
}

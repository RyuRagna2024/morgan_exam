// app/(manager)/_components/profile/ProfileEditModal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle, // <<< IMPORTED DialogTitle
  DialogClose,
} from "@/components/ui/dialog"; // Adjust path if needed
import { SessionUser } from "../../SessionProvider";
import AvatarUploadForm from "./AvatarUploadForm"; // Import the adapted form
// import ProfileInfoForm from "./ProfileInfoForm"; // Placeholder for future form

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SessionUser | null; // Pass current user data
  // Handlers passed from the page
  onProfileInfoSubmit: (data: any) => Promise<void>; // Type 'any' for now, update when ProfileInfoForm is built
  onImagesUploaded: (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => Promise<void>;
  // Loading states passed from the page
  isProfileUpdating: boolean;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileInfoSubmit,
  onImagesUploaded,
  isProfileUpdating, // This prop is for the ProfileInfoForm, not used directly here yet
}) => {
  // Don't render modal if user data isn't available yet or if not open
  if (!user || !isOpen) return null;

  // Handler to bridge the upload completion to the page's handler
  const handleUploadComplete = async (
    newAvatar: string | null,
    newBg: string | null,
  ) => {
    await onImagesUploaded(newAvatar, newBg); // Call the handler passed from the settings page
    // Closing logic is now handled within AvatarUploadForm or by the page's handler if needed
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Dialog Header with Title and Close button */}
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle> {/* <<< ADDED DialogTitle */}
          <DialogClose /> {/* Standard close button from shadcn/ui */}
        </DialogHeader>

        {/* Image Upload Section */}
        <div className="my-6">
          {/* Render the form that handles both avatar and background */}
          <AvatarUploadForm
            currentAvatarUrl={user.avatarUrl}
            currentBackgroundUrl={user.backgroundUrl}
            onUploadComplete={handleUploadComplete} // Pass the combined handler
            onCloseRequest={onClose} // Pass the main close handler so the form can trigger close
          />
        </div>

        {/* Separator between sections */}
        <hr className="my-6 border-border" />

        {/* Basic Profile Info Form Section (Placeholder) */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-center">
            Profile Details
          </h3>
          <p className="text-center text-muted-foreground text-sm">
            {/* This is where the form for first name, last name, etc. will go */}
            (Profile details form component will go here)
          </p>
          {/* TODO: Add and render the ProfileInfoForm component here */}
          {/* Example:
             <ProfileInfoForm
                user={user} // Pass initial data
                onSubmit={onProfileInfoSubmit} // Pass handler from page
                isUpdating={isProfileUpdating} // Pass loading state from page
             />
          */}
        </div>

        {/* Dialog Footer might not be strictly needed if each form section has its own save/cancel */}
        {/* <DialogFooter>
             <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
             {/* A main save button could go here if you have multiple forms saved at once }
           </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;

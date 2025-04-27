// app/(manager)/_components/profile/ProfileEditModal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// Use the SessionUser type defined specifically for the manager context
import { SessionUser } from "../../SessionProvider";
// Import the form component
import AvatarUploadForm from "./AvatarUploadForm";

// Props expected by this Modal component
interface ProfileEditModalProps {
  isOpen: boolean; // State to control modal visibility
  onClose: () => void; // Function to close the modal
  user: SessionUser; // The current user data (non-null when modal is open)
  // Callback function passed from the parent (ProfileSection)
  // This will be called by AvatarUploadForm via its own prop mechanism
  onSuccess: (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user, // Receive user data
  onSuccess, // Receive the success handler from ProfileSection
}) => {
  // This handler acts as a bridge. It will be passed to AvatarUploadForm
  // under the prop name that AvatarUploadForm expects (onUploadComplete).
  // When AvatarUploadForm calls its onUploadComplete, this function executes,
  // which in turn calls the onSuccess function passed down from ProfileSection.
  const handleUploadCompleteForForm = (
    newAvatar: string | null,
    newBg: string | null,
  ) => {
    onSuccess(newAvatar, newBg); // Call the original handler passed from ProfileSection
    // Closing the modal is handled within AvatarUploadForm after the success toast/delay
  };

  // The Dialog component handles the open/close state via the 'open' and 'onOpenChange' props
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        {" "}
        {/* Content wrapper */}
        <DialogHeader>
          <DialogTitle>Edit Images</DialogTitle>
          <DialogDescription>
            Update your profile picture and background image.
          </DialogDescription>
          {/* Shadcn Dialog implicitly adds a close button here */}
        </DialogHeader>
        {/* Render the Upload Form Inside */}
        <div className="mt-4 mb-6">
          {" "}
          {/* Add some margin */}
          {/* Pass the necessary props down to the actual form */}
          <AvatarUploadForm
            currentAvatarUrl={user.avatarUrl} // Pass current URLs from user prop
            currentBackgroundUrl={user.backgroundUrl}
            // Pass the bridge handler as the 'onUploadComplete' prop,
            // matching what AvatarUploadForm expects based on its definition
            onUploadComplete={handleUploadCompleteForForm}
            // Pass the onClose function so the form can request closure
            onCloseRequest={onClose}
          />
        </div>
        {/* Footer removed as actions are within AvatarUploadForm */}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;

// app/(manager)/_components/profile/ProfileEditModal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Optional: if you want description
  DialogClose,
} from "@/components/ui/dialog";
import { SessionUser } from "../../SessionProvider";
import AvatarUploadForm from "./AvatarUploadForm";

// Simplify props: Only need user for initial URLs, open state, close handler, and the success callback
interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SessionUser; // Expect non-null user when modal is open
  onImagesUploaded: ( // Callback from ProfileSection
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => void; // Changed return to void as ProfileSection handles state
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onImagesUploaded,
}) => {
  // No need to check user/isOpen here, Dialog handles open state
  // The parent component (ProfileSection) ensures user exists before rendering

  // Handler passed to AvatarUploadForm
  const handleUploadComplete = (
    newAvatar: string | null,
    newBg: string | null,
  ) => {
    onImagesUploaded(newAvatar, newBg); // Call the handler passed from ProfileSection
    // Closing is handled within AvatarUploadForm after success/toast
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]"> {/* Adjusted size slightly */}
        <DialogHeader>
          <DialogTitle>Edit Images</DialogTitle>
          <DialogDescription>
             Update your profile picture and background image.
          </DialogDescription>
          {/* DialogClose is implicitly added by shadcn Dialog */}
        </DialogHeader>

        {/* Image Upload Section ONLY */}
        <div className="mt-4 mb-6"> {/* Adjusted margin */}
          <AvatarUploadForm
            currentAvatarUrl={user.avatarUrl}
            currentBackgroundUrl={user.backgroundUrl}
            onUploadComplete={handleUploadComplete} // Pass the handler down
            onCloseRequest={onClose} // Allow form to request close
          />
        </div>

        {/* Removed Profile Info Section and Separator */}
        {/* Removed DialogFooter */}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
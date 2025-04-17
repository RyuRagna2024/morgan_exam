// app/(manager)/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "../SessionProvider";
import ProfileSection from "../_components/profile/ProfileSection";
import ProfileEditModal from "../_components/profile/ProfileEditModal";
import { SessionUser } from "../SessionProvider";
import { updateManagerProfileInfo } from "./actions";
import { ProfileUpdateFormValues } from "../_components/profile/types";
import { toast } from "sonner";

console.log("--- Loading ManagerSettingsPage Component ---"); // <<< ADDED

export default function ManagerSettingsPage() {
  console.log("--- Rendering ManagerSettingsPage ---"); // <<< ADDED

  const { user: sessionUser, updateProfile: updateClientSessionProfile } =
    useSession();
  console.log("useSession hook result:", { sessionUser }); // <<< ADDED

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(
    sessionUser,
  );

  useEffect(() => {
    console.log("useEffect running - sessionUser:", sessionUser); // <<< ADDED
    setCurrentUser(sessionUser);
  }, [sessionUser]);

  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleProfileInfoSubmit = async (data: ProfileUpdateFormValues) => {
    // ... (rest of function)
  };

  const handleImagesUploaded = async (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => {
    // ... (rest of function)
  };

  console.log("--- Before returning JSX, currentUser:", currentUser); // <<< ADDED

  // --- Render the Page Content ---
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>

      <ProfileSection user={currentUser} onEditClick={handleOpenEditModal} />

      {currentUser && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={currentUser}
          onProfileInfoSubmit={handleProfileInfoSubmit}
          onImagesUploaded={handleImagesUploaded}
          isProfileUpdating={isProfileUpdating}
        />
      )}
    </div>
  );
}

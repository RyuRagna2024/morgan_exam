// app/(customer)_components/(sidebar)/ProfileSection.tsx

"use client";

import { useState, useEffect } from "react"; // Added useEffect
import Image from "next/image";
import { Pencil } from "lucide-react";
import ProfileEditModal from "./ProfileEditModal"; // Assuming ProfileEditModal.tsx is in the same directory
import AvatarUploadForm from "./AvatarUploadForm"; // Assuming AvatarUploadForm.tsx is in the same directory
import UserAvatar from "../UserAvatar"; // Assuming UserAvatar.tsx is one level up
import { useSession } from "../../SessionProvider";

// Define a more specific type for the user prop based on SessionUser, if possible
// Or keep it general if it comes from different sources sometimes.
interface ProfileSectionProps {
  user: {
    id?: string; // Keep optional if sometimes not available initially
    displayName?: string;
    avatarUrl?: string | null;
    backgroundUrl?: string | null;
  };
  isCollapsed: boolean;
}

export default function ProfileSection({
  user: initialUser, // Rename prop to avoid conflict with session user
  isCollapsed,
}: ProfileSectionProps) {
  // State to control the visibility of the edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Get the session context ---
  // Use the session hook to access the globally managed user data and update function
  const { user: sessionUser, updateProfile } = useSession();

  // --- State for the currently displayed URLs ---
  // Initialize with session data primarily, fallback to initial prop data.
  // This ensures the component reflects the latest session state on mount/re-render.
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    sessionUser?.avatarUrl ?? initialUser.avatarUrl ?? null,
  );
  const [currentBackgroundUrl, setCurrentBackgroundUrl] = useState<
    string | null
  >(sessionUser?.backgroundUrl ?? initialUser.backgroundUrl ?? null);

  // --- Effect to synchronize with session changes ---
  // If the user data in the session context changes (e.g., updated elsewhere),
  // update the local state of this component to match.
  useEffect(() => {
    setCurrentAvatarUrl(sessionUser?.avatarUrl ?? null);
    setCurrentBackgroundUrl(sessionUser?.backgroundUrl ?? null);
  }, [sessionUser?.avatarUrl, sessionUser?.backgroundUrl]); // Re-run if these specific session values change

  // --- Modal control functions ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // --- Callback for successful image upload ---
  const handleAvatarUpdateSuccess = (
    newAvatarUrl: string | null, // This will be the PERMANENT URL from the server action
    newBackgroundUrl: string | null, // This will be the PERMANENT URL from the server action
  ) => {
    // 1. Update the local state for immediate UI feedback in *this* component
    // This is technically redundant now because the effect above will catch the session update,
    // but it can make the UI feel slightly snappier as it doesn't wait for the effect cycle.
    setCurrentAvatarUrl(newAvatarUrl);
    setCurrentBackgroundUrl(newBackgroundUrl);

    // 2. Update the global session context state
    // This is the CRUCIAL step for persistence across the app session.
    updateProfile({
      avatarUrl: newAvatarUrl ?? undefined, // Pass undefined to avoid overwriting with null if not updated
      backgroundUrl: newBackgroundUrl ?? undefined,
    });

    // Note: AvatarUploadForm now handles closing the modal after its success toast/delay.
  };

  // --- Derived values based on props/state ---
  const avatarSize = isCollapsed ? 48 : 96;
  const backgroundSizeClasses = isCollapsed ? "h-16 w-16" : "h-32 w-full";

  // Determine the display name - prioritize session data, fallback to initial prop
  const displayName =
    sessionUser?.displayName || initialUser.displayName || "Customer Name";

  // --- Render Component ---
  return (
    <div
      className={`${
        isCollapsed ? "py-6 px-2" : "p-6" // Dynamic padding based on collapsed state
      } border-b border-sidebar-border flex flex-col items-center`} // Use a consistent border color variable if possible
    >
      {/* Wrapper for Background and Avatar positioning */}
      <div className="relative w-full flex justify-center mt-4">
        {/* Background Image Section */}
        <div
          className={`${backgroundSizeClasses} relative overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 rounded-lg`}
          aria-label="User background container"
        >
          {currentBackgroundUrl ? ( // Render using the LOCAL STATE variable
            <Image
              src={currentBackgroundUrl} // Use LOCAL STATE variable
              alt="User background"
              fill
              className="object-cover" // Ensures image covers the div
              priority={!isCollapsed} // Prioritize loading if not collapsed
              key={currentBackgroundUrl} // Add key for better updates if URL changes
            />
          ) : (
            // Show placeholder text only if not collapsed and no background exists
            !isCollapsed && (
              <p className="text-white flex items-center justify-center h-full text-sm text-center px-2">
                No background
              </p>
            )
          )}

          {/* Edit Icon for Background (only visible when not collapsed) */}
          {!isCollapsed && (
            <div
              onClick={openModal} // Opens the edit modal
              className="absolute right-2 top-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-100 transition-colors z-10"
              aria-label="Edit background"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openModal()} // Accessibility
            >
              <Pencil size={14} className="text-gray-700" />
            </div>
          )}
        </div>{" "}
        {/* End Background Image Section */}
        {/* Avatar Image Container (Positioned absolutely relative to the wrapper) */}
        <div
          className={`${
            isCollapsed
              ? "h-12 w-12 left-1/2 -translate-x-1/2 -bottom-6" // Centered, small, overlaps bottom when collapsed
              : "h-24 w-24 left-6 -bottom-12" // Larger, positioned left, overlaps bottom when expanded
          } absolute transition-all duration-300 z-10 rounded-full border-white border-[3px]`} // White border for separation
          aria-label="User avatar container"
        >
          {/* Use the UserAvatar component, passing the LOCAL STATE variable */}
          <UserAvatar
            avatarUrl={currentAvatarUrl} // Pass LOCAL STATE variable
            size={avatarSize} // Dynamic size
            className="" // Add any specific override classes if needed
          />
          {/* Edit Icon for Avatar (Always visible, positioned on the avatar) */}
          <div
            onClick={openModal} // Opens the edit modal
            className="absolute -right-1 -bottom-1 bg-teal-500 rounded-full w-7 h-7 flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:bg-teal-400 transition-colors z-20" // Positioned bottom-right
            aria-label="Edit profile picture"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal()} // Accessibility
          >
            <Pencil size={14} className="text-white" />
          </div>
        </div>{" "}
        {/* End Avatar Image Container */}
      </div>{" "}
      {/* End Relative Wrapper for Background/Avatar */}
      {/* User Info and Edit Button Section (Only visible when not collapsed) */}
      {!isCollapsed && (
        <>
          {/* Display Name */}
          <h2 className="text-xl font-semibold mt-16">
            {" "}
            {/* Margin top to account for overlapping avatar */}
            {displayName} {/* Display name from session or prop */}
          </h2>

          {/* Edit Profile Button */}
          <div className="flex gap-3 mt-4 w-full">
            <button
              onClick={openModal} // Opens the edit modal
              className="w-full py-2 px-3 bg-slate-600 text-white rounded text-center font-medium hover:bg-slate-500 transition"
            >
              Edit Profile
            </button>
          </div>
        </>
      )}
      {/* --- Profile Edit Modal --- */}
      {/* Render the modal conditionally based on isModalOpen state */}
      <ProfileEditModal isOpen={isModalOpen} onClose={closeModal}>
        {/* Pass the CURRENT LOCAL state URLs and the success handler to the form */}
        <AvatarUploadForm
          avatarUrl={currentAvatarUrl} // Pass current LOCAL state
          backgroundUrl={currentBackgroundUrl} // Pass current LOCAL state
          onSuccess={handleAvatarUpdateSuccess} // Pass the callback function
          onClose={closeModal} // Pass the close function
        />
      </ProfileEditModal>
    </div> // End main component div
  );
}

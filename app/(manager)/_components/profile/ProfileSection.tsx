// app/(manager)/_components/profile/ProfileSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
// Import SessionUser type ALONG WITH the hook
import { SessionUser, useSession } from "../../SessionProvider"; // <<< IMPORT SessionUser type
import UserAvatar from "../UserAvatar";
import ProfileEditModal from "./ProfileEditModal";
import AvatarUploadForm from "./AvatarUploadForm";

// --- CORRECT the user prop type ---
interface ProfileSectionProps {
  user: SessionUser; // <<< CHANGE THIS to expect the full SessionUser
  isCollapsed: boolean;
}

export default function ProfileSection({
  user: initialUser, // The renaming is still good practice
  isCollapsed,
}: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: sessionUser, updateProfile } = useSession();

  // Local state for URLs, synchronized with session
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    // Use initialUser prop for initial values, sync with sessionUser in effect
    initialUser.avatarUrl ?? null,
  );
  const [currentBackgroundUrl, setCurrentBackgroundUrl] = useState<
    string | null
  >(initialUser.backgroundUrl ?? null);

  // Sync local state with session changes (important if updates happen elsewhere)
  useEffect(() => {
    if (sessionUser) {
      // Check if sessionUser exists
      setCurrentAvatarUrl(sessionUser.avatarUrl ?? null);
      setCurrentBackgroundUrl(sessionUser.backgroundUrl ?? null);
    }
  }, [sessionUser?.avatarUrl, sessionUser?.backgroundUrl]); // Depend on session changes

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleUploadSuccess = (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => {
    updateProfile({
      avatarUrl: newAvatarUrl ?? undefined,
      backgroundUrl: newBackgroundUrl ?? undefined,
    });
    // Local state update can be removed here as the useEffect handles syncing with session
    // setCurrentAvatarUrl(newAvatarUrl);
    // setCurrentBackgroundUrl(newBackgroundUrl);
    // Closing handled by AvatarUploadForm
  };

  const avatarSize = isCollapsed ? 48 : 96;
  const backgroundSizeClasses = isCollapsed ? "h-16 w-16" : "h-32 w-full";
  // Prefer sessionUser for display name if available, fallback to initialUser
  const displayName =
    sessionUser?.displayName || initialUser.displayName || "Manager";

  return (
    <div
      className={`${
        isCollapsed ? "py-6 px-2" : "p-6"
      } border-b border-border flex flex-col items-center relative`}
    >
      {/* Wrapper for Background and Avatar positioning */}
      <div className="relative w-full flex justify-center mt-4">
        {/* Background Image Section */}
        <div
          className={`${backgroundSizeClasses} relative overflow-hidden bg-muted transition-all duration-300 rounded-lg border border-border`}
          aria-label="User background container"
        >
          {currentBackgroundUrl ? (
            <Image
              src={currentBackgroundUrl}
              alt="User background"
              fill
              style={{ objectFit: "cover" }}
              priority={!isCollapsed}
              key={currentBackgroundUrl} // Re-render if URL changes
            />
          ) : (
            !isCollapsed && (
              <p className="text-muted-foreground flex items-center justify-center h-full text-xs text-center px-1">
                No background
              </p>
            )
          )}
          {!isCollapsed && (
            <button
              onClick={openModal}
              className="absolute right-1 top-1 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow cursor-pointer hover:bg-gray-100 transition-colors z-10 ring-1 ring-border"
              aria-label="Edit background image"
            >
              <Pencil size={12} className="text-gray-700" />
            </button>
          )}
        </div>

        {/* Avatar Image Container */}
        <div
          className={`${
            isCollapsed
              ? "h-12 w-12 left-1/2 -translate-x-1/2 -bottom-6"
              : "h-24 w-24 left-4 -bottom-12"
          } absolute transition-all duration-300 z-10 rounded-full border-background border-[3px] shadow-md`}
          aria-label="User avatar container"
        >
          <UserAvatar
            avatarUrl={currentAvatarUrl} // Use local state which syncs with session
            size={avatarSize}
            className="bg-muted"
          />
          <button
            onClick={openModal}
            className="absolute -right-1 -bottom-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow border-2 border-background cursor-pointer hover:bg-primary/90 transition-colors z-20"
            aria-label="Edit profile picture"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="text-center w-full">
          <h2 className="text-lg font-semibold mt-16 truncate px-2">
            {displayName}
          </h2>
          {/* Use initialUser for email as it comes from the server initially */}
          {initialUser.email && (
            <p className="text-xs text-muted-foreground mt-1 truncate px-2">
              {initialUser.email}
            </p>
          )}
        </div>
      )}

      {/* --- Profile Edit Modal --- */}
      {/* initialUser is guaranteed to be SessionUser type here */}
      {initialUser && (
        <ProfileEditModal
          isOpen={isModalOpen}
          onClose={closeModal}
          user={initialUser} // This is now type-safe
          onImagesUploaded={handleUploadSuccess}
        />
      )}
    </div>
  );
}

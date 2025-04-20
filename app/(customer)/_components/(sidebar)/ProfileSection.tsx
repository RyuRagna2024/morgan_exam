// app/(customer)_components/(sidebar)/ProfileSection.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Keep Image import
import { Pencil } from "lucide-react";
import ProfileEditModal from "./ProfileEditModal";
import AvatarUploadForm from "./AvatarUploadForm";
import UserAvatar from "../UserAvatar";
import { useSession } from "../../SessionProvider";

interface ProfileSectionProps {
  user: {
    id?: string;
    displayName?: string;
    avatarUrl?: string | null;
    backgroundUrl?: string | null;
  };
  isCollapsed: boolean;
}

export default function ProfileSection({
  user: initialUser,
  isCollapsed,
}: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: sessionUser, updateProfile } = useSession();

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    sessionUser?.avatarUrl ?? initialUser.avatarUrl ?? null,
  );
  const [currentBackgroundUrl, setCurrentBackgroundUrl] = useState<
    string | null
  >(sessionUser?.backgroundUrl ?? initialUser.backgroundUrl ?? null);

  useEffect(() => {
    setCurrentAvatarUrl(sessionUser?.avatarUrl ?? null);
    setCurrentBackgroundUrl(sessionUser?.backgroundUrl ?? null);
  }, [sessionUser?.avatarUrl, sessionUser?.backgroundUrl]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAvatarUpdateSuccess = (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => {
    setCurrentAvatarUrl(newAvatarUrl);
    setCurrentBackgroundUrl(newBackgroundUrl);
    updateProfile({
      avatarUrl: newAvatarUrl ?? undefined,
      backgroundUrl: newBackgroundUrl ?? undefined,
    });
  };

  const avatarSize = isCollapsed ? 48 : 96;
  const backgroundSizeClasses = isCollapsed ? "h-16 w-16" : "h-32 w-full";
  const displayName =
    sessionUser?.displayName || initialUser.displayName || "Customer Name";

  return (
    <div
      className={`${
        isCollapsed ? "py-6 px-2" : "p-6"
      } border-b border-border flex flex-col items-center`}
    >
      <div className="relative w-full flex justify-center mt-4">
        {/* Background Image Section */}
        <div
          className={`${backgroundSizeClasses} relative overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 transition-all duration-300 rounded-lg`}
          aria-label="User background container"
        >
          {currentBackgroundUrl ? (
            // --- ADDED alt prop ---
            <Image
              src={currentBackgroundUrl}
              alt={`${displayName}'s background image`} // Meaningful alt text
              fill
              className="object-cover"
              priority={!isCollapsed}
              key={currentBackgroundUrl}
              // Optional: Add sizes prop if you know the rendered dimensions
              // sizes="(max-width: 768px) 100vw, 64rem" // Example sizes
            />
          ) : (
            // --- END ADDED alt prop ---
            !isCollapsed && (
              <p className="text-white dark:text-gray-300 flex items-center justify-center h-full text-sm text-center px-2">
                No background
              </p>
            )
          )}

          {/* Edit Icon for Background */}
          {!isCollapsed && (
            <div
              onClick={openModal}
              className="absolute right-2 top-2 bg-white dark:bg-gray-700 rounded-full w-7 h-7 flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors z-10"
              aria-label="Edit background"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openModal()}
            >
              <Pencil size={14} className="text-gray-700 dark:text-gray-300" />
            </div>
          )}
        </div>{" "}
        {/* End Background Image Section */}
        {/* Avatar Image Container */}
        <div
          className={`${
            isCollapsed
              ? "h-12 w-12 left-1/2 -translate-x-1/2 -bottom-6"
              : "h-24 w-24 left-6 -bottom-12"
          } absolute transition-all duration-300 z-10 rounded-full border-white dark:border-gray-800 border-[3px]`}
          aria-label="User avatar container"
        >
          <UserAvatar avatarUrl={currentAvatarUrl} size={avatarSize} />
          {/* Edit Icon for Avatar */}
          <div
            onClick={openModal}
            className="absolute -right-1 -bottom-1 bg-teal-500 dark:bg-teal-600 rounded-full w-7 h-7 flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 cursor-pointer hover:bg-teal-400 dark:hover:bg-teal-500 transition-colors z-20"
            aria-label="Edit profile picture"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal()}
          >
            <Pencil size={14} className="text-white" />
          </div>
        </div>{" "}
        {/* End Avatar Image Container */}
      </div>{" "}
      {/* End Relative Wrapper */}
      {/* User Info and Edit Button Section */}
      {!isCollapsed && (
        <>
          {/* Display Name */}
          <h2 className="text-xl font-semibold mt-16 text-foreground">
            {displayName}
          </h2>

          {/* Edit Profile Button */}
          <div className="flex gap-3 mt-4 w-full">
            <button
              onClick={openModal}
              className="w-full py-2 px-3 bg-slate-600 dark:bg-slate-700 text-white rounded text-center font-medium hover:bg-slate-500 dark:hover:bg-slate-600 transition"
            >
              Edit Profile
            </button>
          </div>
        </>
      )}
      {/* Profile Edit Modal */}
      <ProfileEditModal isOpen={isModalOpen} onClose={closeModal}>
        <AvatarUploadForm
          avatarUrl={currentAvatarUrl}
          backgroundUrl={currentBackgroundUrl}
          onSuccess={handleAvatarUpdateSuccess}
          onClose={closeModal}
        />
      </ProfileEditModal>
    </div>
  );
}

// app/(manager)/_components/profile/ProfileSection.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import ProfileEditModal from "./ProfileEditModal";
import UserAvatar from "../UserAvatar";
import { useSession } from "../../SessionProvider";
import { SessionUser } from "../../SessionProvider";
import { cn } from "@/lib/utils"; // Import cn

interface ProfileSectionProps {
  user: SessionUser | null; // Allow null
  isCollapsed: boolean;
}

export default function ProfileSection({
  user,
  isCollapsed,
}: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: sessionUser, updateProfile } = useSession();

  // Initialize state from props or session, preferring session if available
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    sessionUser?.avatarUrl ?? user?.avatarUrl ?? null,
  );
  const [currentBackgroundUrl, setCurrentBackgroundUrl] = useState<
    string | null
  >(sessionUser?.backgroundUrl ?? user?.backgroundUrl ?? null);

  // Update state if session context changes
  useEffect(() => {
    setCurrentAvatarUrl(sessionUser?.avatarUrl ?? null);
    setCurrentBackgroundUrl(sessionUser?.backgroundUrl ?? null);
  }, [sessionUser?.avatarUrl, sessionUser?.backgroundUrl]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleImagesUploaded = (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => {
    updateProfile({
      avatarUrl: newAvatarUrl,
      backgroundUrl: newBackgroundUrl,
    });
    // Optionally update local state too, though useEffect above should handle it
    // setCurrentAvatarUrl(newAvatarUrl);
    // setCurrentBackgroundUrl(newBackgroundUrl);
    closeModal(); // Close modal on success
  };

  const avatarSize = isCollapsed ? 48 : 96;
  const backgroundSizeClasses = isCollapsed ? "h-16 w-16" : "h-32 w-full";
  // Determine which user object to use for display (prefer sessionUser if available)
  const displayUser = sessionUser ?? user;
  const displayName = displayUser?.displayName || "Manager";
  const displayAvatarUrl = currentAvatarUrl;
  const displayBackgroundUrl = currentBackgroundUrl;

  return (
    // Outer div with padding and border
    <div
      className={cn(
        "border-b border-border flex flex-col items-center shrink-0",
        isCollapsed ? "py-6 px-2" : "p-6",
      )}
    >
      {/* Check if we have ANY user data to display */}
      {!displayUser ? (
        // Simplified Placeholder if no user data AT ALL
        <div
          className={cn(
            "relative w-full flex justify-center mt-4",
            backgroundSizeClasses,
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden bg-muted rounded-lg w-full h-full animate-pulse",
            )}
          ></div>
        </div>
      ) : (
        // Render content if we have user data
        <>
          {" "}
          {/* Use Fragment */}
          <div className="relative w-full flex justify-center mt-4">
            {/* Background Image Section */}
            <div
              className={cn(
                backgroundSizeClasses,
                "relative overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 transition-all duration-300 rounded-lg",
              )}
              aria-label="User background container"
            >
              {displayBackgroundUrl ? (
                <Image
                  src={displayBackgroundUrl}
                  alt={`${displayName}'s background image`}
                  fill
                  className="object-cover"
                  priority={!isCollapsed}
                  key={displayBackgroundUrl}
                />
              ) : (
                !isCollapsed && (
                  <p className="text-white dark:text-gray-300 flex items-center justify-center h-full text-sm text-center px-2">
                    {" "}
                    No background{" "}
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
                  <Pencil
                    size={14}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </div>
              )}
            </div>{" "}
            {/* End Background Image Section */}
            {/* Avatar Image Container */}
            <div
              className={cn(
                "absolute transition-all duration-300 z-10 rounded-full border-white dark:border-gray-800 border-[3px]",
                isCollapsed
                  ? "h-12 w-12 left-1/2 -translate-x-1/2 -bottom-6"
                  : "h-24 w-24 left-6 -bottom-12",
              )}
              aria-label="User avatar container"
            >
              <UserAvatar avatarUrl={displayAvatarUrl} size={avatarSize} />
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
            <div className="flex flex-col items-center w-full">
              {" "}
              {/* Ensure this div wraps the content */}
              <h2 className="text-xl font-semibold mt-16 text-foreground text-center truncate w-full px-2">
                {" "}
                {displayName}{" "}
              </h2>
              {/* Display email */}
              {displayUser.email && (
                <p className="text-xs text-muted-foreground truncate max-w-full px-2">
                  {displayUser.email}
                </p>
              )}
              {/* Edit Button */}
              <div className="flex mt-4 w-full px-2">
                {" "}
                {/* Added px-2 for button padding from edge */}
                <button
                  onClick={openModal}
                  className="w-full py-2 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-center font-medium transition"
                >
                  {" "}
                  Edit Profile{" "}
                </button>
              </div>
            </div> // Closing div added
          )}
          {/* Profile Edit Modal */}
          {/* Render modal only if user exists */}
          {displayUser && ( // Use displayUser which prefers sessionUser
            <ProfileEditModal
              isOpen={isModalOpen}
              onClose={closeModal}
              user={displayUser} // Pass the non-null user
              onSuccess={handleImagesUploaded} // Use correct prop name
            />
          )}
        </> // End Fragment
      )}
    </div> // End Outer div
  );
}

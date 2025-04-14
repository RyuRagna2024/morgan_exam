// src/components/AvatarUploadForm.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image"; // For Background Image
import { User as UserIcon, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For Avatar
import toast from "react-hot-toast";
import { uploadAvatar } from "./_profile-actions/profile-upload";

interface AvatarUploadFormProps {
  avatarUrl: string | null;
  backgroundUrl: string | null;
  onSuccess: (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => void;
  onClose: () => void;
}

export default function AvatarUploadForm({
  avatarUrl,
  backgroundUrl,
  onSuccess,
  onClose,
}: AvatarUploadFormProps) {
  // State for the files selected by the user
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [selectedBackgroundFile, setSelectedBackgroundFile] =
    useState<File | null>(null);

  // State for the URL to *display* in the preview (can be original URL or temporary blob URL)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    avatarUrl,
  );
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<
    string | null
  >(backgroundUrl);

  // State specifically to track the *currently active blob URLs* created by this component instance
  const [currentAvatarBlobUrl, setCurrentAvatarBlobUrl] = useState<
    string | null
  >(null);
  const [currentBackgroundBlobUrl, setCurrentBackgroundBlobUrl] = useState<
    string | null
  >(null);

  // State for loading indicator
  const [isUploading, setIsUploading] = useState(false);

  // Refs for the hidden file input elements
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // --- Helper Function to Revoke Blob URLs ---
  const revokeUrl = (url: string | null) => {
    // Only revoke if it's a blob URL
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  // --- File Selection Handlers ---
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedAvatarFile(file); // Store the selected file

    // Revoke the *previous* blob URL if one existed for the avatar
    revokeUrl(currentAvatarBlobUrl);

    // Create a *new* temporary blob URL for preview
    const newPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(newPreviewUrl); // Update the display URL
    setCurrentAvatarBlobUrl(newPreviewUrl); // Store the new blob URL for later revocation
  };

  const handleBackgroundFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedBackgroundFile(file); // Store the selected file

    // Revoke the *previous* blob URL if one existed for the background
    revokeUrl(currentBackgroundBlobUrl);

    // Create a *new* temporary blob URL for preview
    const newPreviewUrl = URL.createObjectURL(file);
    setBackgroundPreviewUrl(newPreviewUrl); // Update the display URL
    setCurrentBackgroundBlobUrl(newPreviewUrl); // Store the new blob URL for later revocation
  };

  // --- Blob URL Cleanup Effect ---
  // This effect runs when the component unmounts to prevent memory leaks
  useEffect(() => {
    // Capture the current blob URLs when the effect is set up
    const avatarBlobToRevoke = currentAvatarBlobUrl;
    const backgroundBlobToRevoke = currentBackgroundBlobUrl;

    // Return a cleanup function
    return () => {
      revokeUrl(avatarBlobToRevoke);
      revokeUrl(backgroundBlobToRevoke);
    };
    // Dependency array ensures cleanup targets the blobs from this specific render cycle
  }, [currentAvatarBlobUrl, currentBackgroundBlobUrl]);

  // --- Form Submission Handler ---
  const handleSubmit = async () => {
    const isAvatarSelected = !!selectedAvatarFile;
    const isBackgroundSelected = !!selectedBackgroundFile;

    // Check if at least one *new* file has been selected
    if (!isAvatarSelected && !isBackgroundSelected) {
      toast.error("Please select a new avatar or background image to upload.");
      return;
    }

    setIsUploading(true); // Show loading state
    const formData = new FormData();

    // Append files to FormData *only if they were selected*
    if (isAvatarSelected && selectedAvatarFile) {
      formData.append("avatar", selectedAvatarFile);
    }
    if (isBackgroundSelected && selectedBackgroundFile) {
      formData.append("background", selectedBackgroundFile);
    }

    try {
      // --- Call the Server Action ---
      const response = await uploadAvatar(formData);

      if (response.success) {
        // Determine the final URLs to pass back
        // Use the URL from the response if it exists (meaning that image was uploaded)
        // Otherwise, keep the original URL passed in via props (meaning that image wasn't changed)
        const finalAvatarUrl = response.avatarUrl ?? avatarUrl;
        const finalBackgroundUrl = response.backgroundUrl ?? backgroundUrl;

        // --- Call parent's success handler with PERMANENT URLs ---
        onSuccess(finalAvatarUrl, finalBackgroundUrl);

        // --- Show Success Toast ---
        let successMessage = "";
        if (isAvatarSelected && isBackgroundSelected) {
          successMessage =
            "Amazing!!! You've successfully updated your profile and background images!!!";
        } else if (isAvatarSelected) {
          successMessage =
            "Amazing!!! You've successfully updated your profile image!!!";
        } else {
          // Only background was selected
          successMessage =
            "Amazing!!! You've successfully updated your background image!!!";
        }
        toast.success(successMessage);

        // --- Close Modal After Delay ---
        setTimeout(() => {
          onClose();
        }, 2000); // 2 seconds delay
      } else {
        // Handle errors reported by the server action
        console.error("Upload failed:", response.error);
        toast.error(response.error || "Upload failed. Please try again.");
        setIsUploading(false); // Stop loading on server error
      }
    } catch (error) {
      // Handle unexpected errors (e.g., network issues)
      console.error("Error calling upload action:", error);
      toast.error("An error occurred during upload. Please try again.");
      setIsUploading(false); // Stop loading on unexpected error
    }
    // No finally block setting isUploading=false here, because onClose handles modal dismissal
  };

  // --- JSX Structure ---
  // Ensure ONLY ONE top-level element is returned (the wrapping div)
  return (
    <div className="text-center">
      {" "}
      {/* Single top-level parent element */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Edit Profile Picture & Background
      </h2>
      {/* Combined background and profile image preview */}
      <div className="mb-6 mx-auto relative">
        {/* Background Image Preview */}
        <div
          className="w-full h-40 rounded-lg overflow-hidden relative bg-gradient-to-r from-blue-400 to-blue-600"
          aria-label="Background image preview container"
        >
          {backgroundPreviewUrl ? (
            <Image // Use next/image for background
              src={backgroundPreviewUrl}
              alt="Background Preview"
              fill
              className="object-cover"
              // Add unoptimized prop *only* for blob URLs, as next/image optimization doesn't work for them
              unoptimized={backgroundPreviewUrl.startsWith("blob:")}
              aria-label="Background image preview"
              key={backgroundPreviewUrl} // Key helps React detect changes
            />
          ) : (
            <p className="text-white flex items-center justify-center h-full">
              No background selected
            </p>
          )}
          {/* Background Edit Icon */}
          <div
            onClick={() => backgroundFileInputRef.current?.click()}
            className="absolute right-3 top-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-100 transition-colors z-10"
            aria-label="Edit background image"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && backgroundFileInputRef.current?.click()
            }
          >
            <Pencil size={16} className="text-gray-700" />
          </div>
        </div>

        {/* Avatar Image Preview */}
        <div className="absolute bottom-0 left-8 transform translate-y-1/3 w-32 h-32">
          {avatarPreviewUrl ? (
            <Avatar className="w-full h-full border-4 border-white shadow-lg">
              <AvatarImage // Use shadcn/ui AvatarImage
                src={avatarPreviewUrl}
                alt="Profile Preview"
                // DO NOT ADD unoptimized here - it's not a valid prop for AvatarImage
                key={avatarPreviewUrl} // Key helps React detect changes
              />
              <AvatarFallback>
                <UserIcon size={64} className="text-slate-300" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-600 rounded-full border-4 border-white shadow-lg">
              <UserIcon size={64} className="text-slate-300" />
            </div>
          )}
          {/* Avatar Edit Icon */}
          <div
            onClick={() => avatarFileInputRef.current?.click()}
            className="absolute right-0 bottom-0 bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:bg-teal-400 transition-colors z-10"
            aria-label="Edit profile picture"
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && avatarFileInputRef.current?.click()
            }
          >
            <Pencil size={16} className="text-white" />
          </div>
        </div>
      </div>{" "}
      {/* End of preview container */}
      {/* Hidden file inputs - These are necessary */}
      <input
        ref={backgroundFileInputRef}
        id="background-upload"
        type="file"
        accept="image/*" // Allow standard image types
        className="hidden" // Keep them hidden
        onChange={handleBackgroundFileSelect}
        aria-label="Upload background image input" // More specific label
      />
      <input
        ref={avatarFileInputRef}
        id="avatar-upload"
        type="file"
        accept="image/*" // Allow standard image types
        className="hidden" // Keep them hidden
        onChange={handleAvatarFileSelect}
        aria-label="Upload profile picture input" // More specific label
      />
      {/* Buttons to trigger hidden inputs */}
      <div className="mb-6 mt-16">
        {" "}
        {/* Added spacing */}
        <button
          type="button" // Prevent accidental form submission
          onClick={() => backgroundFileInputRef.current?.click()} // Trigger the hidden input
          className="w-full py-3 px-3 bg-teal-500 text-white rounded text-center font-medium hover:bg-teal-400 transition cursor-pointer"
          aria-label="Select new background image"
        >
          {/* Dynamic button text */}
          {selectedBackgroundFile
            ? "Change Background Image"
            : "Select Background Image"}
        </button>
        {/* Display name of selected file */}
        {selectedBackgroundFile && (
          <p className="mt-2 text-sm text-gray-500" aria-live="polite">
            Selected: {selectedBackgroundFile.name}
          </p>
        )}
      </div>
      <div className="mb-6">
        <button
          type="button" // Prevent accidental form submission
          onClick={() => avatarFileInputRef.current?.click()} // Trigger the hidden input
          className="w-full py-3 px-3 bg-teal-500 text-white rounded text-center font-medium hover:bg-teal-400 transition cursor-pointer"
          aria-label="Select new profile picture"
        >
          {/* Dynamic button text */}
          {selectedAvatarFile ? "Change Avatar" : "Select Avatar"}
        </button>
        {/* Display name of selected file */}
        {selectedAvatarFile && (
          <p className="mt-2 text-sm text-gray-500" aria-live="polite">
            Selected: {selectedAvatarFile.name}
          </p>
        )}
      </div>
      {/* Action Buttons (Cancel/Save) */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose} // Close modal immediately on cancel
          className="w-1/2 py-3 px-3 bg-slate-200 rounded text-slate-800 text-center font-medium hover:bg-slate-300 transition"
          disabled={isUploading} // Disable cancel while upload is in progress (optional, but good practice)
          aria-label="Cancel changes"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit} // Trigger the upload process
          className="w-1/2 py-3 px-3 bg-teal-500 rounded text-white text-center font-medium hover:bg-teal-400 transition disabled:bg-teal-300 disabled:cursor-not-allowed"
          disabled={
            // Disable if EITHER no new file is selected OR an upload is in progress
            (!selectedAvatarFile && !selectedBackgroundFile) || isUploading
          }
          aria-label="Save profile changes"
        >
          {isUploading ? "Saving..." : "Save"}
        </button>
      </div>
    </div> // End of the single top-level parent element
  );
}

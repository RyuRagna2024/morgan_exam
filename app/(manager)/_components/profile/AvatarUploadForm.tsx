// app/(manager)/_components/profile/AvatarUploadForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User as UserIcon, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner"; // Using sonner
import { Button } from "@/components/ui/button";
import { uploadManagerImages } from "../../settings/actions"; // Import manager server action

interface AvatarUploadFormProps {
  // URLs passed from the modal/page (reflecting current state)
  currentAvatarUrl: string | null;
  currentBackgroundUrl: string | null;
  // Callback when upload action is successful (receives potentially new URLs)
  onUploadComplete: (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => void;
  // Function to close the parent modal
  onCloseRequest: () => void;
}

export default function AvatarUploadForm({
  currentAvatarUrl: initialAvatarUrl, // Rename props for clarity
  currentBackgroundUrl: initialBackgroundUrl,
  onUploadComplete,
  onCloseRequest,
}: AvatarUploadFormProps) {
  // State for the files selected by the user
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [selectedBackgroundFile, setSelectedBackgroundFile] =
    useState<File | null>(null);

  // State for the URL to *display* in the preview
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    initialAvatarUrl,
  );
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<
    string | null
  >(initialBackgroundUrl);

  // State to track active blob URLs for cleanup
  const [currentAvatarBlobUrl, setCurrentAvatarBlobUrl] = useState<
    string | null
  >(null);
  const [currentBackgroundBlobUrl, setCurrentBackgroundBlobUrl] = useState<
    string | null
  >(null);

  // Loading indicator
  const [isUploading, setIsUploading] = useState(false);

  // Refs for the hidden file input elements
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // --- Helper to Revoke Blob URLs ---
  const revokeUrl = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  // --- File Selection Handlers ---
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedAvatarFile(file);
    revokeUrl(currentAvatarBlobUrl); // Revoke previous blob
    const newPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(newPreviewUrl);
    setCurrentAvatarBlobUrl(newPreviewUrl);
    e.target.value = ""; // Reset input value so selecting the same file again works
  };

  const handleBackgroundFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedBackgroundFile(file);
    revokeUrl(currentBackgroundBlobUrl); // Revoke previous blob
    const newPreviewUrl = URL.createObjectURL(file);
    setBackgroundPreviewUrl(newPreviewUrl);
    setCurrentBackgroundBlobUrl(newPreviewUrl);
    e.target.value = ""; // Reset input value
  };

  // --- Blob URL Cleanup Effect ---
  useEffect(() => {
    // Capture the current blob URLs when the effect is set up
    const avatarBlob = currentAvatarBlobUrl;
    const bgBlob = currentBackgroundBlobUrl;

    // Return a cleanup function
    return () => {
      revokeUrl(avatarBlob);
      revokeUrl(bgBlob);
    };
    // Dependency array ensures cleanup targets the blobs from this specific render cycle
  }, [currentAvatarBlobUrl, currentBackgroundBlobUrl]);

  // --- Form Submission Handler ---
  const handleSubmit = async () => {
    const isAvatarSelected = !!selectedAvatarFile;
    const isBackgroundSelected = !!selectedBackgroundFile;

    // Check if at least one *new* file has been selected (client-side check)
    if (!isAvatarSelected && !isBackgroundSelected) {
      toast.error("Please select a new avatar or background image.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    // Append files only if they were selected
    if (isAvatarSelected && selectedAvatarFile) {
      formData.append("avatar", selectedAvatarFile);
    }
    if (isBackgroundSelected && selectedBackgroundFile) {
      formData.append("background", selectedBackgroundFile);
    }

    try {
      // Call the MANAGER server action
      const response = await uploadManagerImages(formData);

      if (response.success) {
        // Determine *what* was successfully updated by comparing response URLs with initial URLs
        const avatarWasUpdated =
          response.avatarUrl !== initialAvatarUrl && response.avatarUrl != null;
        const backgroundWasUpdated =
          response.backgroundUrl !== initialBackgroundUrl &&
          response.backgroundUrl != null;

        let successMessage = "Profile updated successfully!"; // Default

        // Set specific success messages based on what changed
        if (avatarWasUpdated && backgroundWasUpdated) {
          successMessage =
            "Awesome! Both profile and background images updated!";
        } else if (avatarWasUpdated) {
          successMessage = "You've updated your profile image successfully!!!";
        } else if (backgroundWasUpdated) {
          successMessage =
            "You've updated your background image successfully!!!";
        }

        toast.success(successMessage); // Show the correct message

        // Call parent's handler with final URLs (new or old)
        // Use ?? null to ensure undefined becomes null, satisfying the callback type
        onUploadComplete(
          response.avatarUrl ?? null,
          response.backgroundUrl ?? null,
        );

        // Close modal after delay
        setTimeout(() => {
          onCloseRequest();
        }, 1500); // Adjust delay if needed
      } else {
        // Handle errors reported by the server action
        toast.error(response.error || "Upload failed. Please try again.");
        setIsUploading(false); // Stop loading on server error
      }
    } catch (error) {
      // Handle unexpected errors (e.g., network issues)
      console.error("Upload action error:", error);
      toast.error("An unexpected error occurred during upload.");
      setIsUploading(false); // Stop loading on unexpected error
    }
    // No finally block setting isUploading=false, because success path closes modal
  };

  // --- Render ---
  return (
    <div className="text-center space-y-4">
      {/* Combined background and profile image preview */}
      <div className="mb-6 mx-auto relative">
        {/* Background Image Preview */}
        <div className="w-full h-40 rounded-lg overflow-hidden relative bg-muted border border-border">
          {backgroundPreviewUrl ? (
            <Image
              src={backgroundPreviewUrl}
              alt="Background Preview"
              fill
              style={{ objectFit: "cover" }}
              // Add unoptimized prop only for blob URLs
              unoptimized={backgroundPreviewUrl.startsWith("blob:")}
              key={backgroundPreviewUrl} // Key helps React detect changes
            />
          ) : (
            <div className="text-muted-foreground flex items-center justify-center h-full">
              No background
            </div>
          )}
          {/* Background Edit Icon/Button */}
          <button
            type="button"
            onClick={() => backgroundFileInputRef.current?.click()}
            className="absolute right-2 top-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow cursor-pointer hover:bg-gray-100 transition-colors z-10 ring-1 ring-border"
            aria-label="Edit background image"
          >
            <Pencil size={14} className="text-gray-700" />
          </button>
        </div>

        {/* Avatar Image Preview */}
        <div className="absolute bottom-0 left-4 transform translate-y-1/4">
          <div className="relative w-28 h-28">
            {" "}
            {/* Container for positioning edit icon */}
            <Avatar className="w-full h-full border-4 border-background shadow-lg bg-muted">
              <AvatarImage
                src={avatarPreviewUrl ?? undefined} // Use undefined if null for AvatarImage
                alt="Avatar Preview"
                key={avatarPreviewUrl} // Key helps React detect changes
              />
              <AvatarFallback>
                <UserIcon size={48} className="text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            {/* Avatar Edit Icon/Button */}
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="absolute right-0 bottom-0 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center shadow border-2 border-background cursor-pointer hover:bg-primary/90 transition-colors z-10"
              aria-label="Edit profile picture"
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={backgroundFileInputRef}
        id="background-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundFileSelect}
        disabled={isUploading}
        aria-label="Background image file input"
      />
      <input
        ref={avatarFileInputRef}
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileSelect}
        disabled={isUploading}
        aria-label="Avatar image file input"
      />

      {/* Selection Info & Action Buttons */}
      <div className="pt-12 space-y-4">
        {" "}
        {/* Add padding top to clear overlapping avatar */}
        {/* Display selected file names */}
        {selectedBackgroundFile && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Background: {selectedBackgroundFile.name}
          </p>
        )}
        {selectedAvatarFile && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Avatar: {selectedAvatarFile.name}
          </p>
        )}
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCloseRequest} // Close modal immediately on cancel
            className="w-full"
            disabled={isUploading} // Disable cancel while uploading
            aria-label="Cancel image changes"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit} // Trigger the upload process
            className="w-full"
            // Disable if EITHER no new file is selected OR an upload is in progress
            disabled={
              (!selectedAvatarFile && !selectedBackgroundFile) || isUploading
            }
            aria-label="Save image changes"
          >
            {isUploading ? "Saving..." : "Save Images"}
          </Button>
        </div>
      </div>
    </div>
  );
}

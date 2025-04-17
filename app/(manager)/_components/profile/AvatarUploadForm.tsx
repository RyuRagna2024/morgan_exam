// app/(manager)/_components/profile/AvatarUploadForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User as UserIcon, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner"; // Using sonner as per manager setup
import { Button } from "@/components/ui/button"; // *** ADDED: Import Button component ***
import { uploadManagerImages } from "../../settings/actions"; // *** ADDED: Import server action ***

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
    e.target.value = ""; // Reset input value
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
    const avatarBlob = currentAvatarBlobUrl;
    const bgBlob = currentBackgroundBlobUrl;
    return () => {
      // Cleanup function
      revokeUrl(avatarBlob);
      revokeUrl(bgBlob);
    };
  }, [currentAvatarBlobUrl, currentBackgroundBlobUrl]);

  // --- Form Submission Handler ---
  const handleSubmit = async () => {
    if (!selectedAvatarFile && !selectedBackgroundFile) {
      toast.error("Please select a new avatar or background image.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    if (selectedAvatarFile) formData.append("avatar", selectedAvatarFile);
    if (selectedBackgroundFile)
      formData.append("background", selectedBackgroundFile);

    try {
      const response = await uploadManagerImages(formData); // Call the MANAGER action

      if (response.success) {
        // Determine the final URLs - use URL from response if that specific image was uploaded,
        // otherwise keep the initial URL passed in via props for that image.
        const finalAvatarUrl = response.avatarUrl ?? initialAvatarUrl;
        const finalBackgroundUrl =
          response.backgroundUrl ?? initialBackgroundUrl;

        onUploadComplete(finalAvatarUrl, finalBackgroundUrl); // Inform parent (page/modal)

        toast.success("Images updated successfully!"); // Simple success message

        // Let the parent component (Modal/Page) handle closing
        // onCloseRequest(); // Or keep the delayed close like customer version if preferred
        setTimeout(() => {
          onCloseRequest();
        }, 1500);
      } else {
        toast.error(response.error || "Upload failed.");
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Upload action error:", error);
      toast.error("An unexpected error occurred during upload.");
      setIsUploading(false);
    }
    // Don't set isUploading false here if closing modal
  };

  // --- Render ---
  // Using the same structure as the Customer AvatarUploadForm provided
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
              unoptimized={backgroundPreviewUrl.startsWith("blob:")}
              key={backgroundPreviewUrl}
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
            aria-label="Edit background image" // Label for the button itself
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
                src={avatarPreviewUrl ?? undefined} // Use undefined if null
                alt="Avatar Preview"
                key={avatarPreviewUrl}
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
              aria-label="Edit profile picture" // Label for the button itself
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={backgroundFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundFileSelect}
        disabled={isUploading}
        aria-label="Background image file input" // *** ADDED: aria-label ***
      />
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileSelect}
        disabled={isUploading}
        aria-label="Avatar image file input" // *** ADDED: aria-label ***
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
          <Button // *** Using imported Button ***
            type="button"
            variant="outline"
            onClick={onCloseRequest}
            className="w-full"
            disabled={isUploading}
            aria-label="Cancel image changes"
          >
            Cancel
          </Button>
          <Button // *** Using imported Button ***
            type="button"
            onClick={handleSubmit}
            className="w-full"
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

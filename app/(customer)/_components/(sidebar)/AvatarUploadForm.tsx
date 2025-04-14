"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadAvatar } from "./_profile-actions/profile-upload";
import { useSession } from "../../SessionProvider";

interface AvatarUploadFormProps {
  avatarUrl: string | null;
  onSuccess: (newAvatarUrl: string) => void;
  onClose: () => void;
}

export default function AvatarUploadForm({
  avatarUrl,
  onSuccess,
  onClose,
}: AvatarUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAvatar } = useSession();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setSelectedFile(file);

    // Create a preview URL
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    return () => {
      if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    };
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const result = await uploadAvatar(formData);

      if (!result.success || !result.avatarUrl) {
        throw new Error(result.error || "Failed to upload avatar");
      }

      // Call the success callback with the new URL
      onSuccess(result.avatarUrl);

      // Update the avatar in the session context
      updateAvatar(result.avatarUrl);

      toast.success("Avatar updated successfully");
      onClose();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while uploading",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Edit Profile Picture
      </h2>

      <div className="mb-6 mx-auto w-32 h-32 relative">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile Preview"
            width={128}
            height={128}
            className="rounded-full w-full h-full object-cover border-4 border-teal-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-600 rounded-full border-4 border-teal-500">
            <UserIcon size={64} className="text-slate-300" />
          </div>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="avatar-upload" className="sr-only">
          Choose profile picture
        </label>
        <input
          ref={fileInputRef}
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Upload profile picture"
          title="Choose a profile picture to upload"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-3 bg-teal-500 text-white rounded text-center font-medium hover:bg-teal-400 transition cursor-pointer"
          aria-controls="avatar-upload"
        >
          Upload New Image
        </button>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-500" aria-live="polite">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="w-1/2 py-3 px-3 bg-slate-200 rounded text-slate-800 text-center font-medium hover:bg-slate-300 transition"
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="w-1/2 py-3 px-3 bg-teal-500 rounded text-white text-center font-medium hover:bg-teal-400 transition disabled:bg-teal-300 disabled:cursor-not-allowed"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Uploading..." : "Save"}
        </button>
      </div>
    </div>
  );
}

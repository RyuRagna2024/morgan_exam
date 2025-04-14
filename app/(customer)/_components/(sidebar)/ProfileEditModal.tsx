"use client";

import { useState, useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  children,
}: ProfileEditModalProps) {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with light white shade */}
      <div
        className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Modal content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
// Removed Input import
import { Label } from "@/components/ui/label";
// Removed Edit Dialog imports
import {
  AlertDialog, // Keep AlertDialog for Delete
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as DeleteAlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as DeleteAlertDialogFooter,
  AlertDialogHeader as DeleteAlertDialogHeader,
  AlertDialogTitle as DeleteAlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Import the new Edit Modal
import BannerEditModal from "./BannerEditModal"; // <<< IMPORT NEW MODAL

// Import useSession from the ROOT provider
import { useSession } from "@/app/SessionProvider";
// Import ONLY the delete server action here now
import { deleteCollectionBanner } from "@/app/(public)/(group-products)/_actions/bannerManagementActions"; // Adjust path if needed

interface EditableCollectionBannerProps {
  initialBannerUrl: string | null | undefined;
  category: string;
  categoryName: string;
  isLoading: boolean;
}

export default function EditableCollectionBanner({
  initialBannerUrl,
  category,
  categoryName,
  isLoading: isLoadingInitialData,
}: EditableCollectionBannerProps) {
  const { user } = useSession();
  const [currentBannerUrl, setCurrentBannerUrl] = useState(initialBannerUrl);
  // Removed urlToEdit state - managed by BannerEditModal now
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control BannerEditModal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // Removed isSaving state - managed by BannerEditModal now
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentBannerUrl(initialBannerUrl);
  }, [initialBannerUrl]);

  const isEditor = user?.role === "EDITOR";

  // --- Edit Modal Handlers ---
  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true); // Just open the modal
  };

  const handleEditSuccess = (newImageUrl: string) => {
    setCurrentBannerUrl(newImageUrl); // Update state on successful upload
    setIsEditModalOpen(false); // Close modal
  };

  // --- Delete Modal Handlers ---
  const handleOpenDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCollectionBanner(category);
    if (result.success) {
      toast.success(result.message || "Banner deleted!");
      setCurrentBannerUrl(null); // Remove banner visually
      setIsDeleteModalOpen(false); // Close modal
    } else {
      if (result.error?.includes("Unauthorized")) {
        toast.error("Unauthorized.");
      } else {
        toast.error(result.error || "Failed to delete banner.");
      }
    }
    setIsDeleting(false);
  };

  if (isLoadingInitialData) {
    // --- UPDATED MARGIN HERE FOR SKELETON ---
    return <Skeleton className="w-full aspect-[4/1] mb-6 md:mb-8 rounded-md" />;
  }

  if (!currentBannerUrl && !isEditor) {
    return null; // Renders nothing, so no margin needed in this case
  }

  return (
    // --- UPDATED MARGIN HERE ON ROOT ELEMENT ---
    <div className="w-full mb-6 md:mb-8 relative group">
      {" "}
      {/* Changed mb-8 to mb-6 md:mb-8 */}
      {/* Banner Display Area */}
      <div className="relative w-full aspect-[4/1] overflow-hidden rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700">
        {currentBannerUrl ? (
          <Image
            src={currentBannerUrl}
            alt={`${categoryName} Collection Banner`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            key={currentBannerUrl}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {isEditor ? "No Banner Set" : ""}
          </div>
        )}

        {/* Editor Icons - Styled like ProductCard */}
        {isEditor && (
          <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
            {/* Edit Button triggers BannerEditModal */}
            <button
              onClick={handleOpenEdit} // Opens the NEW modal
              className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/70 transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Edit ${categoryName} Banner`}
              title={`Edit ${categoryName} Banner`}
            >
              {" "}
              <Edit3 size={14} />{" "}
            </button>

            {/* Delete Button - Only show if there IS a banner */}
            {currentBannerUrl && (
              <button
                onClick={handleOpenDelete} // Opens the Delete confirmation
                className="p-1.5 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800/70 transition shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label={`Delete ${categoryName} Banner`}
                title={`Delete ${categoryName} Banner`}
              >
                {" "}
                <Trash2 size={14} />{" "}
              </button>
            )}
          </div>
        )}
      </div>
      {/* --- Render BannerEditModal --- */}
      {/* It controls its own visibility via the 'open' prop */}
      <BannerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={category}
        categoryName={categoryName}
        currentImageUrl={currentBannerUrl}
        onSuccess={handleEditSuccess} // Pass callback to update state
      />
      {/* --- End BannerEditModal --- */}
      {/* --- Delete Confirmation AlertDialog (Stays the Same) --- */}
      {isEditor && ( // Still need conditional render based on role
        <AlertDialog
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
        >
          <DeleteAlertDialogContent>
            <DeleteAlertDialogHeader>
              <DeleteAlertDialogTitle>
                Are you absolutely sure?
              </DeleteAlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the banner for the &quot;
                {categoryName}&quot; collection. This action can&apos;t be
                undone.
              </AlertDialogDescription>
            </DeleteAlertDialogHeader>
            <DeleteAlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </DeleteAlertDialogFooter>
          </DeleteAlertDialogContent>
        </AlertDialog>
      )}
      {/* --- End Delete Confirmation --- */}
    </div>
  );
}

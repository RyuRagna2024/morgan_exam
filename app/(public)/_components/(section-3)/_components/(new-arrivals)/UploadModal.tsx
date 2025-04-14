// _components/(new-arrivals)/UploadModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import useNewArrivalsStore from "../../_store/(new-store)/new-arrival-store";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const { createNewArrival, isLoading, error, clearError } =
    useNewArrivalsStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (rating === 0) {
      return; // Could add error handling for rating
    }

    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());

    try {
      await createNewArrival(formData);
      onClose();
    } catch (error) {
      console.error("Error uploading:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Arrival</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    value <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                  onClick={() => setRating(value)}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearError();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || rating === 0}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

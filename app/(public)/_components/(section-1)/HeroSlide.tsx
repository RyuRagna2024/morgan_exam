// app/(public)/_components/(section-1)/HeroSlide.tsx
"use client"; // <--- Added "use client"
import React from "react"; // <--- Added React import
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import type { Slide } from "./types";
import AddSlideModal from "./AddSlideModal";
import EditSlideModal from "./EditSlideModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SLIDE_INTERVAL } from "./utils";
import type { UserRole } from "@prisma/client";
import { useSlideStore } from "./_crud-actions/_store/use-slide-store";
import { cn } from "@/lib/utils";

interface HeroSliderProps {
  autoPlay?: boolean;
  interval?: number;
  onSlidesChange?: () => void;
  userRole?: UserRole;
  initialSlides: Slide[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({
  autoPlay = true,
  interval = SLIDE_INTERVAL,
  userRole,
  initialSlides,
}) => {
  const MAX_SLIDES = 4;
  const EMPTY_SLOTS = 4;

  const { slides, isLoading, deleteSlide, setSlides } = useSlideStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const isEditor = userRole === "EDITOR";
  const isModalOpen =
    isAddModalOpen || isEditModalOpen || isDeleteModalOpen || isDeleting;

  useEffect(() => {
    // Simplified initialization: If not initialized and initialSlides exist, set them.
    if (!isInitialized && initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
      setIsInitialized(true);
    } else if (!isInitialized && slides.length > 0) {
      // Also initialize if store already has slides (e.g., hydration)
      setIsInitialized(true);
    }
  }, [initialSlides, setSlides, isInitialized, slides.length]); // Added slides.length

  // Use the slides from the store for calculations
  const totalSlotsToShow = isEditor
    ? Math.min(Math.max(EMPTY_SLOTS, slides.length), MAX_SLIDES)
    : Math.max(0, slides.length); // Non-editors only see existing slides

  const nextSlide = useCallback(() => {
    if (totalSlotsToShow <= 1) return;
    setCurrentSlide((current) => (current + 1) % totalSlotsToShow);
  }, [totalSlotsToShow]);

  const prevSlide = useCallback(() => {
    if (totalSlotsToShow <= 1) return;
    setCurrentSlide(
      (current) => (current - 1 + totalSlotsToShow) % totalSlotsToShow,
    );
  }, [totalSlotsToShow]);

  useEffect(() => {
    if (!autoPlay || isLoading || isModalOpen || totalSlotsToShow <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, isLoading, isModalOpen, totalSlotsToShow]); // Added totalSlotsToShow

  const handleSuccess = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setTargetIndex(null);
  }, []);
  const handleAddClick = useCallback((index: number) => {
    setCurrentSlide(index);
    setTargetIndex(index);
    setTimeout(() => {
      setIsAddModalOpen(true);
    }, 100); // Reduced delay
  }, []);
  const handleDeleteConfirm = async () => {
    // Original delete logic - ensure it updates state correctly
    try {
      setIsDeleting(true);
      const slide = slides[currentSlide];
      if (!slide) return;
      const result = await deleteSlide(slide.id);
      if (result.success) {
        toast.success("Slide deleted successfully");
        const newLength = slides.length - 1;
        if (currentSlide >= newLength) {
          setCurrentSlide(Math.max(0, newLength - 1));
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete slide",
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Loading State (Use Theme colors)
  if (isLoading && !isInitialized) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <div className="relative w-full h-[300px] bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Loading Slides...</p>
        </div>
      </div>
    );
  }

  // Empty State (Non-editor)
  if (slides.length === 0 && !isEditor) {
    return null;
  }

  // Editor Empty State
  if (slides.length === 0 && isEditor) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <div className="relative w-full h-[300px] overflow-hidden rounded-lg bg-muted">
          <div className="absolute top-2 right-2 z-20 bg-black/50 rounded-md p-1.5 space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
              onClick={() => handleAddClick(0)}
              aria-label="Add new slide"
            >
              {" "}
              <Plus className="w-4 h-4" />{" "}
            </Button>
          </div>
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border bg-muted hover:bg-accent transition-colors cursor-pointer"
              onClick={() => handleAddClick(0)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleAddClick(0)}
            >
              <Plus className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-lg text-muted-foreground"> Add Slide 1 </p>
            </div>
          </div>
        </div>
        {isEditor && (
          <AddSlideModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleSuccess}
            targetIndex={targetIndex !== null ? targetIndex : 0}
          />
        )}
      </div>
    );
  }

  // --- Main Render ---
  return (
    // 1. Constrain Width & Add Margin
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-6">
      {/* 2. Viewport Container */}
      <div className="relative w-full h-[300px] overflow-hidden rounded-lg bg-muted">
        {/* Editor Controls (Positioned absolutely) */}
        {isEditor && (
          <div className="absolute top-2 right-2 z-30 bg-black/50 rounded-md p-1.5 space-x-2">
            {slides.length < MAX_SLIDES && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                onClick={() => handleAddClick(slides.length)}
                aria-label="Add new slide"
              >
                {" "}
                <Plus className="w-4 h-4" />{" "}
              </Button>
            )}
            {slides[currentSlide] && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit current slide"
                >
                  {" "}
                  <Pencil className="w-4 h-4" />{" "}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-destructive/80 hover:text-white"
                  onClick={() => setIsDeleteModalOpen(true)}
                  aria-label="Delete current slide"
                  disabled={isDeleting}
                >
                  {" "}
                  <Trash className="w-4 h-4" />{" "}
                </Button>
              </>
            )}
          </div>
        )}
        {/* Track: Holds all slides */}
        <div
          // Use original translate approach, but ensure track width is sufficient
          className="h-full flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${totalSlotsToShow * 100}%`, // Track width = N * 100%
            transform: `translateX(-${(currentSlide / totalSlotsToShow) * 100}%)`,
          }}
        >
          {/* Map Slides */}
          {[...Array(totalSlotsToShow)].map((_, index) => {
            const slide = slides[index];
            return (
              // Each Slide Item
              <div
                key={slide ? slide.id : `empty-${index}`}
                // Set width explicitly to fraction of TRACK width
                className="h-full flex-shrink-0" // Prevent shrinking
                style={{ width: `${100 / totalSlotsToShow}%` }}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1}`}
              >
                {/* Slide Content */}
                {slide ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center text-white text-center p-4">
                    {slide.sliderImageurl && (
                      <Image
                        src={slide.sliderImageurl}
                        alt={slide.title || "Slide background"}
                        fill
                        priority={index === 0}
                        className="object-cover -z-10" // Ensure image is behind text overlay
                        sizes="100vw"
                      />
                    )}
                    <div className="relative z-10 bg-black/40 p-4 rounded-md">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {slide.title}
                      </h2>
                      <p className="text-base md:text-lg">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                ) : isEditor ? (
                  // Editor Empty Slot
                  <div
                    className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border bg-muted hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleAddClick(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddClick(index)
                    }
                  >
                    <Plus className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-lg text-muted-foreground">
                      {" "}
                      Add Slide {index + 1}{" "}
                    </p>
                  </div>
                ) : null}
              </div> // End Slide Item
            );
          })}
        </div>{" "}
        {/* End Track */}
        {/* Conditional Arrows (Inside relative container) */}
        {isEditor && !isModalOpen && totalSlotsToShow > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full h-8 w-8 bg-background/50 hover:bg-background/80 border-none text-foreground"
              aria-label="Previous slide"
            >
              {" "}
              <ChevronLeft className="h-5 w-5" />{" "}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full h-8 w-8 bg-background/50 hover:bg-background/80 border-none text-foreground"
              aria-label="Next slide"
            >
              {" "}
              <ChevronRight className="h-5 w-5" />{" "}
            </Button>
          </>
        )}
      </div>{" "}
      {/* End Viewport Relative Container */}
      {/* Dots Container (Below viewport) */}
      {totalSlotsToShow > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {[...Array(totalSlotsToShow)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors duration-300",
                currentSlide === index
                  ? "bg-primary"
                  : "bg-primary/30 hover:bg-primary/50",
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? "true" : "false"}
            />
          ))}
        </div>
      )}
      {/* Modals */}
      {isEditor && (
        <>
          <AddSlideModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleSuccess}
            targetIndex={targetIndex !== null ? targetIndex : 0}
          />
          {isEditModalOpen && slides[currentSlide] && (
            <EditSlideModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSuccess={handleSuccess}
              slide={slides[currentSlide]}
            />
          )}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            {/* Delete Dialog Content */}
            <DialogContent>
              {" "}
              <DialogHeader>
                {" "}
                <DialogTitle>Confirm Deletion</DialogTitle>{" "}
                <DialogDescription>
                  {" "}
                  Are you sure you want to delete this slide? This cannot be
                  undone.{" "}
                </DialogDescription>{" "}
              </DialogHeader>{" "}
              <DialogFooter>
                {" "}
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>{" "}
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {" "}
                  {isDeleting ? "Deleting..." : "Delete"}{" "}
                </Button>{" "}
              </DialogFooter>{" "}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div> // End Outermost container
  );
};

export default HeroSlider;

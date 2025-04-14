"use client";
import React, { useState, useEffect, useCallback } from "react";
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
    if (!isInitialized && initialSlides?.length > 0) {
      setSlides(initialSlides);
      setIsInitialized(true);
    }
  }, [initialSlides, setSlides, isInitialized]);

  const nextSlide = useCallback(() => {
    const totalSlides = Math.max(slides.length, EMPTY_SLOTS);
    setCurrentSlide((current) => (current + 1) % totalSlides);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    const totalSlides = Math.max(slides.length, EMPTY_SLOTS);
    setCurrentSlide((current) =>
      current === 0 ? totalSlides - 1 : current - 1,
    );
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay || isLoading || isModalOpen) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, isLoading, isModalOpen]);

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
    }, 500); // Wait for slide transition to complete
  }, []);

  if (isLoading && !isEditor) {
    return (
      <div className="relative w-screen h-[300px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const totalSlotsToShow = isEditor
    ? Math.min(Math.max(EMPTY_SLOTS, slides.length), MAX_SLIDES)
    : Math.max(1, slides.length);

  return (
    <div className="relative w-screen h-[300px] overflow-hidden bg-gray-100">
      {isEditor && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 rounded-lg p-2">
          <div className="flex items-center gap-4">
            {slides.length < MAX_SLIDES && (
              <button
                onClick={() => handleAddClick(slides.length)}
                className="hover:text-blue-400 transition-colors"
                aria-label="Add new slide"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            )}
            {slides[currentSlide] && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="hover:text-blue-400 transition-colors"
                  aria-label="Edit current slide"
                >
                  <Pencil className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="hover:text-blue-400 transition-colors"
                  aria-label="Delete current slide"
                  disabled={isDeleting}
                >
                  <Trash className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="w-[400%] h-full flex">
        <div
          className={cn(
            "w-full h-full flex transform transition-transform duration-500 ease-in-out",
            currentSlide === 0 ? "-translate-x-0" : "",
            currentSlide === 1 ? "-translate-x-1/4" : "",
            currentSlide === 2 ? "-translate-x-2/4" : "",
            currentSlide === 3 ? "-translate-x-3/4" : "",
          )}
        >
          {[...Array(totalSlotsToShow)].map((_, index) => {
            const slide = slides[index];
            return (
              <div
                key={slide ? slide.id : `empty-${index}`}
                className="w-1/4 flex-shrink-0 h-full"
              >
                {slide ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
                    {slide.sliderImageurl && (
                      <Image
                        src={slide.sliderImageurl}
                        alt={slide.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                      />
                    )}
                    <div className="relative z-10">
                      <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                      <p className="text-xl">{slide.description}</p>
                    </div>
                  </div>
                ) : isEditor && slides.length < MAX_SLIDES ? (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleAddClick(index)}
                  >
                    <Plus className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-xl text-gray-500">
                      Add Slide {index + 1}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {!isModalOpen && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 transition-colors p-2 rounded-full text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 transition-colors p-2 rounded-full text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {[...Array(totalSlotsToShow)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index
                ? slides[index]
                  ? "bg-white"
                  : "bg-gray-600"
                : slides[index]
                  ? "bg-white/50"
                  : "bg-gray-300"
            }`}
            aria-label={`Go to ${slides[index] ? "slide" : "empty slot"} ${index + 1}`}
          />
        ))}
      </div>

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slide? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  setIsDeleting(true);
                  const slide = slides[currentSlide];
                  if (!slide) return;

                  const result = await deleteSlide(slide.id);
                  if (result.success) {
                    toast.success("Slide deleted successfully");
                    if (currentSlide >= slides.length - 1) {
                      setCurrentSlide(Math.max(0, slides.length - 2));
                    }
                  } else {
                    throw new Error(result.error);
                  }
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to delete slide",
                  );
                } finally {
                  setIsDeleting(false);
                  setIsDeleteModalOpen(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroSlider;

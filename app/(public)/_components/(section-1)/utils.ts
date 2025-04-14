import { Slide } from "./types";

export const SLIDE_INTERVAL = 5000;

export const getNextSlideIndex = (
  currentIndex: number,
  totalSlides: number,
): number => {
  return (currentIndex + 1) % totalSlides;
};

export const getPrevSlideIndex = (
  currentIndex: number,
  totalSlides: number,
): number => {
  return (currentIndex - 1 + totalSlides) % totalSlides;
};

export const slideTranslateClasses = [
  "translate-x-0", // changed from -translate-x-0
  "-translate-x-full",
  "-translate-x-[200%]",
  "-translate-x-[300%]",
];

// Optional: Type for slide transition
export interface SlideTransition {
  currentIndex: number;
  totalSlides: number;
  translateClass: string;
}

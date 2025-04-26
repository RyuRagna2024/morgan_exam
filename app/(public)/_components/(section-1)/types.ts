// app/(public)/_components/(section-1)/types.ts
// Base types that match the Prisma schema

export interface Slide {
  id: string;
  sliderImageurl: string; // Added to match Prisma schema
  title: string;
  description: string;
  bgColor: string;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type for creating a new slide
export interface CreateSlideInput {
  sliderImageurl: string; // Added to match Prisma schema
  title: string;
  description: string;
  bgColor: string;
  order: number;
}

// Type for updating a slide
export interface UpdateSlideInput {
  id: string;
  sliderImageurl?: string; // Added as optional field for updates
  title?: string;
  description?: string;
  bgColor?: string;
  order?: number;
}

// Type for the UI component props
export interface SlideComponentProps {
  slide: Slide;
  onEdit?: (slide: Slide) => void;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
}

// Action types for state management
export type SlideAction =
  | { type: "ADD_SLIDE"; payload: CreateSlideInput }
  | { type: "UPDATE_SLIDE"; payload: UpdateSlideInput }
  | { type: "DELETE_SLIDE"; payload: string }
  | { type: "REORDER_SLIDES"; payload: { id: string; newOrder: number }[] }
  | { type: "SET_SLIDES"; payload: Slide[] };

// Response types for API calls
export interface SlideResponse {
  success: boolean;
  data?: Slide;
  error?: string;
}

export interface SlidesResponse {
  success: boolean;
  data?: Slide[];
  error?: string;
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];

export const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB

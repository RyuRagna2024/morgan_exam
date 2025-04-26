// app/(public)/_components/(section-1)/_crud-actions/_store/use-slide-store.ts

import { create } from "zustand";
import { Slide, SlideResponse } from "../../types";
import { createSlide } from "../action";
import { updateSlide } from "../update-actions";
import { deleteSlide } from "../delete-actions";

interface SlideState {
  slides: Slide[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSlides: (slides: Slide[]) => void;
  createSlide: (formData: FormData) => Promise<SlideResponse>;
  updateSlide: (formData: FormData) => Promise<SlideResponse>;
  deleteSlide: (id: string) => Promise<SlideResponse>;
  reset: () => void;
}

const initialState = {
  slides: [],
  isLoading: false,
  error: null,
};

export const useSlideStore = create<SlideState>((set, get) => ({
  ...initialState,

  setSlides: (slides) => {
    set({ slides });
  },

  createSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createSlide(formData);
      if (response.success && response.data) {
        set((state) => ({
          slides: [...state.slides, response.data!],
        }));
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  updateSlide: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateSlide(formData);
      if (response.success && response.data) {
        set((state) => ({
          slides: state.slides.map((slide) =>
            slide.id === response.data!.id ? response.data! : slide,
          ),
        }));
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSlide: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteSlide(id);
      if (response.success) {
        set((state) => ({
          slides: state.slides.filter((slide) => slide.id !== id),
        }));
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set(initialState);
  },
}));

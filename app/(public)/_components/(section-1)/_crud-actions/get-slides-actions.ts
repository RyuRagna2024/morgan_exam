// app/(public)/_components/(section-1)/_crud-actions/get-slides-actions.ts

"use server";

import prisma from "@/lib/prisma";
import { type SlidesResponse } from "../types";
import { cache } from "react";

// Cache the server action
export const getSlides = cache(async (): Promise<SlidesResponse> => {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        sliderImageurl: true,
        title: true,
        description: true,
        bgColor: true,
        order: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: slides,
    };
  } catch (error) {
    console.error("Error fetching slides:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
});

"use server";

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { type SlideResponse } from "../types";

export async function deleteSlide(slideId: string): Promise<SlideResponse> {
  try {
    // Validate user authentication and authorization
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized access");
    if (user.role !== "EDITOR") {
      return redirect("/login");
    }

    // Get the slide to find its image URL before deletion
    const slide = await prisma.slide.findUnique({
      where: { id: slideId },
    });

    if (!slide) {
      throw new Error("Slide not found");
    }

    // Delete the image from blob storage if it exists
    if (slide.sliderImageurl) {
      try {
        // Extract the path from the URL
        const url = new URL(slide.sliderImageurl);
        const pathname = url.pathname.slice(1); // Remove leading slash
        await del(pathname);
      } catch (error) {
        console.error("Error deleting image from blob storage:", error);
        // Continue with slide deletion even if image deletion fails
      }
    }

    // Delete the slide from the database
    const deletedSlide = await prisma.slide.delete({
      where: { id: slideId },
    });

    // After successful deletion, reorder remaining slides if needed
    await prisma.slide.updateMany({
      where: {
        order: {
          gt: deletedSlide.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });

    return {
      success: true,
      data: deletedSlide,
    };
  } catch (error) {
    console.error("Error deleting slide:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

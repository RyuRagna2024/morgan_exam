"use server";

import { validateRequest } from "@/auth";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// Allowed audio types
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/ogg", // OGG
  "audio/aac", // AAC
  "audio/flac", // FLAC
  "audio/m4a", // M4A
  "audio/mp4", // MP4 Audio
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type AudioResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function uploadAudio(formData: FormData): Promise<AudioResponse> {
  try {
    // Try to get the authenticated user (if available)
    const { user } = await validateRequest();
    const userId = user?.id || null;

    // Get audio file from form data
    const file = formData.get("audioFile") as File;

    // Validate file exists
    if (!file || !file.size) throw new Error("No audio file provided");

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      throw new Error(
        "Invalid file type. Allowed types are MP3, WAV, OGG, AAC, FLAC, M4A, and MP4 Audio",
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 10MB");
    }

    // Upload audio to blob storage
    const fileExt = file.name.split(".").pop() || "mp3";
    const timestamp = Date.now();
    const uniqueId = userId || `anon-${uuidv4().slice(0, 8)}`;
    const path = `audio/audio_${uniqueId}_${timestamp}.${fileExt}`;

    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    if (!blob.url) throw new Error("Failed to get URL from blob storage");

    // Create audio record in database
    const audio = await prisma.audio.create({
      data: {
        audioUrl: blob.url,
        userId: userId, // May be null for anonymous uploads
      },
    });

    return {
      success: true,
      data: audio,
    };
  } catch (error) {
    console.error("Error uploading audio:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

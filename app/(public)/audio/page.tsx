import React from "react";
import { Music } from "lucide-react";
import AudioForm from "./AudioForm";

const AudioPage = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Music className="h-8 w-8 mr-2 text-primary" />
          Audio Uploader
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload your audio files to share with the community
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supported formats: MP3, WAV, OGG, AAC, FLAC, M4A (Max: 10MB)
        </p>
      </div>

      <div className="w-full max-w-md">
        <AudioForm />
      </div>
    </div>
  );
};

export default AudioPage;

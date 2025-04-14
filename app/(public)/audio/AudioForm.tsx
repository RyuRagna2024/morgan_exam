"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "@/app/SessionProvider"; // Import useSession
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Music } from "lucide-react";
import { uploadAudio } from "./action";

// Define allowed audio types
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

// Define the schema for form validation
const formSchema = z.object({
  audioFile: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: "Audio file is required",
    })
    .refine((files) => files[0]?.size <= MAX_FILE_SIZE, {
      message: `File size must be less than 10MB`,
    })
    .refine((files) => ALLOWED_AUDIO_TYPES.includes(files[0]?.type), {
      message:
        "File type not supported. Please upload an audio file (MP3, WAV, OGG, etc.)",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const AudioForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { user } = useSession();

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audioFile: undefined,
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
      form.setValue("audioFile", files, { shouldValidate: true });
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (values.audioFile && values.audioFile.length > 0) {
        formData.append("audioFile", values.audioFile[0]);
      }

      const response = await uploadAudio(formData);

      if (response.success) {
        toast.success("Audio successfully uploaded");
        form.reset();
        setSelectedFileName(null);
      } else {
        toast.error(response.error || "Failed to upload audio");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <Music className="h-8 w-8 text-primary mr-2" />
        <h2 className="text-2xl font-bold">Upload Audio</h2>
      </div>

      {user && (
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Uploading as {user.displayName}
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="audioFile"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Audio File</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="cursor-pointer"
                      {...rest}
                    />
                    {selectedFileName && (
                      <p className="text-sm text-muted-foreground truncate">
                        Selected: {selectedFileName}
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Audio"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AudioForm;

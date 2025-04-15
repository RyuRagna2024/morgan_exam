// src/app/(customer)/_actions/submit-support-request.ts

"use server";

import { validateRequest } from "@/auth"; // Adjust path to your auth
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma"; // Adjust path to your prisma client
import { supportRequestSchema } from "../validations";

// Define the response type for the client
export type SubmitSupportResponse = {
  success: boolean;
  message: string; // User-friendly message
};

export async function submitSupportRequest(
  formData: FormData,
): Promise<SubmitSupportResponse> {
  try {
    // 1. Authenticate the user
    const { user } = await validateRequest();
    if (!user) {
      return { success: false, message: "Unauthorized: Please log in." };
    }

    // 2. Extract data from FormData
    const rawFormData = {
      title: formData.get("title"),
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      attachment: formData.get("attachment"), // Get the file
    };

    // Handle empty file input specifically for Zod validation
    // If the file input is empty, 'attachment' might be a File object with size 0
    // Zod's optional() handles null/undefined, but we need to coerce empty File to undefined
    const attachmentFile =
      rawFormData.attachment instanceof File && rawFormData.attachment.size > 0
        ? rawFormData.attachment
        : undefined;

    // 3. Validate the data using Zod schema
    const validationResult = supportRequestSchema.safeParse({
      ...rawFormData,
      attachment: attachmentFile, // Pass the potentially undefined file
    });

    if (!validationResult.success) {
      // Combine specific Zod error messages for better feedback
      const errorMessages = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("\n");
      console.error("Support Form Validation Error:", errorMessages);
      return {
        success: false,
        // Provide a generic message or the first error
        message: `Validation failed: ${validationResult.error.errors[0]?.message || "Please check your input."}`,
      };
    }

    // Use the validated data from now on
    const validatedData = validationResult.data;
    let uploadedAttachmentUrl: string | null = null;

    // 4. Handle File Upload (if attachment exists)
    if (validatedData.attachment) {
      try {
        const file = validatedData.attachment;
        const fileExt = file.name.split(".").pop() || "bin";
        // Create a unique path, e.g., support-attachments/user_<userId>/<timestamp>.<ext>
        const filePath = `support-attachments/user_${user.id}/${Date.now()}_${file.name}`;

        const blob = await put(filePath, file, {
          access: "public", // Or 'private' if access control is needed later
          addRandomSuffix: false,
        });
        uploadedAttachmentUrl = blob.url;
      } catch (uploadError) {
        console.error("Attachment Upload Error:", uploadError);
        return {
          success: false,
          message: "Failed to upload attachment. Please try again.",
        };
      }
    }

    // 5. Save the support ticket to the database
    try {
      await prisma.supportTicket.create({
        data: {
          title: validatedData.title,
          name: validatedData.name, // Using validated name
          email: validatedData.email, // Using validated email
          message: validatedData.message,
          attachmentUrl: uploadedAttachmentUrl, // This will be null if no file was uploaded
          status: "OPEN", // Default status
          userId: user.id, // Link to the authenticated user
        },
      });

      // 6. Return Success
      return {
        success: true,
        message: "Support request submitted successfully!",
      };
    } catch (dbError) {
      console.error("Database Error Creating Support Ticket:", dbError);
      return {
        success: false,
        message: "Failed to save support request. Please try again later.",
      };
    }
  } catch (error) {
    console.error("Unexpected Error in submitSupportRequest:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

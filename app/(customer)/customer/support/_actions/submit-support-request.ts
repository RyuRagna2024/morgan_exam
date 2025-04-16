"use server";

import { validateRequest } from "@/auth"; // Adjust path if needed
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { supportRequestSchema } from "../validations";

export type SubmitSupportResponse = {
  success: boolean;
  message: string;
};

export async function submitSupportRequest(
  formData: FormData,
): Promise<SubmitSupportResponse> {
  try {
    // 1. Authenticate user
    const { user } = await validateRequest();
    if (!user) {
      return { success: false, message: "Unauthorized: Please log in." };
    }
    // Add console log to verify user ID
    console.log("Authenticated User ID for ticket creation:", user.id);

    // 2. Extract data
    const rawFormData = {
      title: formData.get("title"),
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      attachment: formData.get("attachment"),
    };
    const attachmentFile =
      rawFormData.attachment instanceof File && rawFormData.attachment.size > 0
        ? rawFormData.attachment
        : undefined;

    // 3. Validate data
    const validationResult = supportRequestSchema.safeParse({
      ...rawFormData,
      attachment: attachmentFile,
    });

    if (!validationResult.success) {
      console.error(
        "Support Form Validation Error:",
        validationResult.error.flatten(),
      ); // Log flattened errors
      return {
        success: false,
        message: `Validation failed: ${validationResult.error.errors[0]?.message || "Please check your input."}`,
      };
    }

    const validatedData = validationResult.data;
    let uploadedAttachmentUrl: string | null = null;

    // 4. Handle File Upload
    if (validatedData.attachment) {
      // (Keep existing file upload logic)
      try {
        const file = validatedData.attachment;
        const filePath = `support-attachments/user_${user.id}/${Date.now()}_${file.name}`;
        const blob = await put(filePath, file, {
          access: "public",
          addRandomSuffix: false,
        });
        uploadedAttachmentUrl = blob.url;
        console.log("Attachment uploaded:", uploadedAttachmentUrl);
      } catch (uploadError) {
        console.error("Attachment Upload Error:", uploadError);
        return { success: false, message: "Failed to upload attachment." };
      }
    }

    // 5. Save the support ticket to the database (CORRECTED DATA OBJECT)
    try {
      console.log("Attempting to create ticket with data:", {
        // Log data before create
        title: validatedData.title,
        name: validatedData.name,
        email: validatedData.email,
        message: validatedData.message,
        attachmentUrl: uploadedAttachmentUrl,
        status: "OPEN",
        creatorId: user.id, // For logging only, connect is used below
      });

      const newTicket = await prisma.supportTicket.create({
        data: {
          // Fields from the form/validation
          title: validatedData.title,
          name: validatedData.name,
          email: validatedData.email,
          message: validatedData.message,
          attachmentUrl: uploadedAttachmentUrl,
          status: "OPEN",
          // --- THIS IS THE FIX ---
          // Connect the 'creator' relation using the user's ID
          creator: {
            connect: {
              id: user.id,
            },
          },
          // --- REMOVE the old 'userId' field ---
          // userId: user.id, // <-- REMOVE THIS LINE
        },
      });

      console.log("Successfully created ticket:", newTicket.id); // Log success

      // 6. Return Success
      return {
        success: true,
        message: "Support request submitted successfully!", // Default success message
      };
    } catch (dbError) {
      // Log the specific database error
      console.error("Database Error Creating Support Ticket:", dbError);
      return {
        success: false,
        message: "Failed to save support request. Please try again later.", // Generic message to client
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

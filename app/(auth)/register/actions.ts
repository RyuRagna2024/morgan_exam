// app/(auth)/register/actions.ts

"use server";

import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { RegisterFormValues, registerSchema } from "./validation";
import { Prisma, UserRole } from "@prisma/client";
import { z } from "zod"; // <<< ADD ZOD IMPORT HERE

export async function signUp(
  formData: RegisterFormValues,
): Promise<{ error?: string } | never> {
  try {
    const validatedData = registerSchema.parse(formData);

    // --- Username check ---
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: { equals: validatedData.username, mode: "insensitive" },
      },
    });
    if (existingUsername) {
      return { error: "Username already taken" };
    }

    // --- Email check ---
    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: validatedData.email, mode: "insensitive" } },
    });
    if (existingEmail) {
      return { error: "Email already taken" };
    }

    // --- Hash password ---
    const passwordHash = await hash(validatedData.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // --- Create User in DB ---
    await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName,
        passwordHash: passwordHash,
        streetAddress: validatedData.streetAddress,
        townCity: validatedData.townCity,
        postcode: validatedData.postcode,
        country: validatedData.country,
        avatarUrl: validatedData.avatarUrl,
        backgroundUrl: validatedData.backgroundUrl,
        agreeTerms: validatedData.agreeTerms,
        role: validatedData.role as UserRole,
        phoneNumber: "", // Explicitly set default
      },
    });

    redirect("/login"); // Or "/register-success"
  } catch (error) {
    // <<< error is initially 'unknown'
    if (isRedirectError(error)) throw error;

    console.error("Registration error:", error);

    // --- Handle Prisma Errors ---
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        if (
          error.meta &&
          typeof error.meta.target === "string" &&
          error.meta.target.includes("username")
        ) {
          return { error: "Username already exists." };
        }
        if (
          error.meta &&
          typeof error.meta.target === "string" &&
          error.meta.target.includes("email")
        ) {
          return { error: "Email already exists." };
        }
        return { error: "Username or email already exists." };
      }
    }

    // --- Handle Zod Errors (Type Check Added) ---
    if (error instanceof z.ZodError) {
      // <<< Check if error is ZodError
      console.error("Zod validation failed on server:", error.flatten());
      // You could potentially extract specific field errors here if needed
      return {
        error: "Invalid registration data provided. Please check the form.",
      };
    }

    // --- Handle Generic Errors ---
    if (error instanceof Error) {
      // <<< Check if it's a standard Error object
      return { error: `Something went wrong: ${error.message}` };
    }

    // --- Fallback for unknown errors ---
    return {
      error:
        "An unexpected error occurred during registration. Please try again.",
    };
  }
}

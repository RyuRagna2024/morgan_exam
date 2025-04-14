"use server";

import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { RegisterFormValues, registerSchema } from "./validation";
import { Prisma, UserRole } from "@prisma/client";

export async function signUp(
  formData: RegisterFormValues,
): Promise<{ error?: string } | never> {
  try {
    const validatedData = registerSchema.parse(formData);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: validatedData.username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: validatedData.email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    ////////////THIS IS THE PART OF THE FUNCTION WHERE ALL PARAMS HAVE PASSED THE CHECKS/////////////

    const passwordHash = await hash(validatedData.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

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
      },
    });

    redirect("/login");
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("Registration error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          error: "Username or email already exists.",
        };
      }
    }

    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

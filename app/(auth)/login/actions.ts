"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { verify } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { LoginFormValues } from "./validation";
import { UserRole } from "@prisma/client";

const roleRoutes: Record<UserRole, string> = {
  [UserRole.USER]: "/register-success",
  [UserRole.CUSTOMER]: "/",
  [UserRole.PROCUSTOMER]: "/pro",
  [UserRole.EDITOR]: "/",
  [UserRole.ADMIN]: "/admin",
  [UserRole.SUPERADMIN]: "/super-admin",
} as const;

export async function login(
  credentials: LoginFormValues,
): Promise<{
  error?: string;
  redirectTo?: string;
  sessionCreated?: boolean;
} | void> {
  try {
    const { email, password } = credentials;

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Invalid email or password",
      };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return {
        error: "Invalid email or password",
      };
    }

    if (!existingUser.agreeTerms) {
      return {
        error: "Please accept the terms and conditions to continue.",
      };
    }

    let sessionCreated = false;

    // Only create session if the user role is NOT UserRole.USER
    if (existingUser.role !== UserRole.USER) {
      try {
        // Create session in the database
        const dbSession = await prisma.session.create({
          data: {
            id: crypto.randomUUID(),
            userId: existingUser.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        const sessionCookie = lucia.createSessionCookie(dbSession.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );

        // Add a small delay to ensure session is properly set
        await new Promise((resolve) => setTimeout(resolve, 100));

        sessionCreated = true;
      } catch (sessionError) {
        console.error("Session creation error:", sessionError);
        return {
          error: "Failed to create session. Please try again.",
        };
      }
    }

    const redirectPath = roleRoutes[existingUser.role];
    if (!redirectPath) {
      return {
        error: "Unable to determine user access. Please contact support.",
      };
    }

    return {
      redirectTo: redirectPath,
      sessionCreated,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Login error:", error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Google } from "arctic";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./lib/prisma";
import { UserRole, Tier } from "@prisma/client";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

interface DatabaseUserAttributes {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  streetAddress: string;
  suburb: string | null;
  townCity: string;
  postcode: string;
  country: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  agreeTerms: boolean;
  role: UserRole;
  tier: Tier; // Added tier here
}

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      username: attributes.username,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      displayName: attributes.displayName,
      email: attributes.email,
      phoneNumber: attributes.phoneNumber,
      streetAddress: attributes.streetAddress,
      suburb: attributes.suburb,
      townCity: attributes.townCity,
      postcode: attributes.postcode,
      country: attributes.country,
      avatarUrl: attributes.avatarUrl,
      backgroundUrl: attributes.backgroundUrl,
      role: attributes.role,
      tier: attributes.tier, // Added tier here
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
);

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}

    return result;
  },
);

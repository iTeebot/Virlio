import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import LinkedIn from "next-auth/providers/linkedin";
import { db } from "@virlio/database";
import { users, accounts, sessions, verificationTokens } from "@virlio/database/schema";
import { env } from "@/lib/config/env";
import { userRepository, badgeRepository } from "@/server/repositories";

const getProviderCredentials = (provider: "google" | "github" | "facebook" | "linkedin") => {
  switch (provider) {
    case "google": {
      const id = (
        process.env.AUTH_GOOGLE_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID ||
        env.AUTH_GOOGLE_ID ||
        ""
      ).trim();
      const secret = (
        process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_AUTH_GOOGLE_SECRET ||
        env.AUTH_GOOGLE_SECRET ||
        ""
      ).trim();
      return id && secret ? { clientId: id, clientSecret: secret } : null;
    }
    case "github": {
      const id = (
        process.env.AUTH_GITHUB_ID ||
        process.env.GITHUB_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ||
        process.env.NEXT_PUBLIC_AUTH_GITHUB_ID ||
        env.AUTH_GITHUB_ID ||
        ""
      ).trim();
      const secret = (
        process.env.AUTH_GITHUB_SECRET ||
        process.env.GITHUB_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_AUTH_GITHUB_SECRET ||
        env.AUTH_GITHUB_SECRET ||
        ""
      ).trim();
      return id && secret ? { clientId: id, clientSecret: secret } : null;
    }
    case "facebook": {
      const id = (
        process.env.AUTH_FACEBOOK_ID ||
        process.env.FACEBOOK_CLIENT_ID ||
        process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ||
        process.env.NEXT_PUBLIC_AUTH_FACEBOOK_ID ||
        env.AUTH_FACEBOOK_ID ||
        ""
      ).trim();
      const secret = (
        process.env.AUTH_FACEBOOK_SECRET ||
        process.env.FACEBOOK_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_AUTH_FACEBOOK_SECRET ||
        env.AUTH_FACEBOOK_SECRET ||
        ""
      ).trim();
      return id && secret ? { clientId: id, clientSecret: secret } : null;
    }
    case "linkedin": {
      const id = (
        process.env.AUTH_LINKEDIN_ID ||
        process.env.LINKEDIN_CLIENT_ID ||
        process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ||
        process.env.NEXT_PUBLIC_AUTH_LINKEDIN_ID ||
        env.AUTH_LINKEDIN_ID ||
        ""
      ).trim();
      const secret = (
        process.env.AUTH_LINKEDIN_SECRET ||
        process.env.LINKEDIN_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_AUTH_LINKEDIN_SECRET ||
        env.AUTH_LINKEDIN_SECRET ||
        ""
      ).trim();
      return id && secret ? { clientId: id, clientSecret: secret } : null;
    }
    default:
      return null;
  }
};

const providers = [];

const googleCreds = getProviderCredentials("google");
if (googleCreds) {
  providers.push(Google(googleCreds));
}

const githubCreds = getProviderCredentials("github");
if (githubCreds) {
  providers.push(GitHub(githubCreds));
}

const facebookCreds = getProviderCredentials("facebook");
if (facebookCreds) {
  providers.push(Facebook(facebookCreds));
}

const linkedinCreds = getProviderCredentials("linkedin");
if (linkedinCreds) {
  providers.push(LinkedIn(linkedinCreds));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as any,
  providers,
  secret: env.AUTH_SECRET,
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    newUser: "/dashboard/overview",
    error: "/login",
  },
  events: {
    // Automatically generate a clean, unique mandatory username when a user signs up via Google / Social OAuth
    async createUser({ user }) {
      try {
        if (user.id && user.email && !(user as any).username) {
          let baseHandle = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "");
          if (baseHandle.length < 3) baseHandle = `user_${baseHandle}`;

          let candidate = baseHandle;
          let counter = 1;

          // Ensure real-time uniqueness against database
          while (await userRepository.findByUsername(candidate)) {
            candidate = `${baseHandle}_${counter++}`;
          }

          await userRepository.update(user.id, { username: candidate });
        }

        // Everyone joining till September 2026 gets Early Adopter badge automatically
        const earlyAdopterCutoff = new Date("2026-10-01T00:00:00Z");
        if (new Date() < earlyAdopterCutoff && user.id) {
          await badgeRepository.awardBadgeBySlug(user.id, "early-adopter").catch(() => null);
        }
      } catch (err) {
        console.error("Error generating username or awarding Early Adopter badge during OAuth createUser event:", err);
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = (user as any).role || "user";
        session.user.username = (user as any).username || null;
      }
      return session;
    },
  },
});

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/virlio"),
  AUTH_SECRET: z.string().default("dev-auth-secret-key-32-chars-long"),

  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  AUTH_FACEBOOK_ID: z.string().optional(),
  AUTH_FACEBOOK_SECRET: z.string().optional(),

  AUTH_LINKEDIN_ID: z.string().optional(),
  AUTH_LINKEDIN_SECRET: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

const _env = envSchema.safeParse(process.env);

// Fallback resolver supporting all standard environment variable prefixes
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/virlio",
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-auth-secret-key-32-chars-long",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000",

  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_AUTH_GOOGLE_SECRET,

  AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET || process.env.NEXT_PUBLIC_AUTH_GITHUB_SECRET,

  AUTH_FACEBOOK_ID: process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID || process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH_FACEBOOK_ID,
  AUTH_FACEBOOK_SECRET: process.env.AUTH_FACEBOOK_SECRET || process.env.FACEBOOK_CLIENT_SECRET || process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET || process.env.NEXT_PUBLIC_AUTH_FACEBOOK_SECRET,

  AUTH_LINKEDIN_ID: process.env.AUTH_LINKEDIN_ID || process.env.LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH_LINKEDIN_ID,
  AUTH_LINKEDIN_SECRET: process.env.AUTH_LINKEDIN_SECRET || process.env.LINKEDIN_CLIENT_SECRET || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET || process.env.NEXT_PUBLIC_AUTH_LINKEDIN_SECRET,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

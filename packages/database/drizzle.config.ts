import { defineConfig } from "drizzle-kit";

const directUrl = process.env.DIRECT_DATABASE_URL || "";
const dbUrl = process.env.DATABASE_URL || "";
const targetUrl = directUrl || dbUrl;

if (!targetUrl || targetUrl.trim().length === 0) {
  console.error("\n❌ [ERROR] Missing Database Configuration:");
  console.error("Neither DIRECT_DATABASE_URL nor DATABASE_URL is defined in environment.");
  console.error("Fix: Set DIRECT_DATABASE_URL in apps/web/.env to your direct PostgreSQL connection string.\n");
  throw new Error("DIRECT_DATABASE_URL or DATABASE_URL must be defined for Drizzle operations.");
}

// Placeholder detection
const PLACEHOLDER_PATTERNS = [
  /aws-0-region/i,
  /your_host/i,
  /your_project/i,
  /your_password/i,
  /your_region/i,
  /example\.com/i,
];

for (const pattern of PLACEHOLDER_PATTERNS) {
  if (pattern.test(targetUrl)) {
    console.error("\n❌ [ERROR] Invalid Database Configuration:");
    console.error("DIRECT_DATABASE_URL is configured with a template placeholder hostname (e.g. aws-0-region.supabase.com).");
    console.error("Expected an actual Supabase direct PostgreSQL hostname (e.g. db.<project-ref>.supabase.co or direct pooler host).");
    console.error("Fix: Replace the placeholder in apps/web/.env with the real direct connection string from your Supabase Connect panel.\n");
    throw new Error("DIRECT_DATABASE_URL contains an invalid placeholder hostname.");
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: targetUrl,
  },
  verbose: true,
  strict: true,
});

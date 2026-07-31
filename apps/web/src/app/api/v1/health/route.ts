import { NextRequest } from "next/server";
import { db } from "@virlio/database";
import { sql } from "drizzle-orm";
import { env } from "@/lib/config/env";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    // 1. Test Database connection and check auth tables
    let dbStatus = {
      connected: false,
      database: null as string | null,
      user: null as string | null,
      tables: {
        users: false,
        accounts: false,
        sessions: false,
        verificationTokens: false,
      },
      error: null as string | null,
    };

    try {
      const result = await db.execute<{ connected: number; db_name: string; current_user: string }>(
        sql`SELECT 1 as connected, current_database() as db_name, current_user`
      );
      const row = (result as any)?.[0] || (result as any)?.[0]?.[0];
      
      dbStatus.connected = true;
      dbStatus.database = row?.db_name || row?.current_database || "postgres";
      dbStatus.user = row?.current_user || "postgres";

      // Test auth table existence in database schema
      try {
        await db.execute(sql`SELECT count(*) FROM users LIMIT 1`);
        dbStatus.tables.users = true;
      } catch (e) {
        dbStatus.tables.users = false;
      }

      try {
        await db.execute(sql`SELECT count(*) FROM accounts LIMIT 1`);
        dbStatus.tables.accounts = true;
      } catch (e) {
        dbStatus.tables.accounts = false;
      }

      try {
        await db.execute(sql`SELECT count(*) FROM sessions LIMIT 1`);
        dbStatus.tables.sessions = true;
      } catch (e) {
        dbStatus.tables.sessions = false;
      }

      try {
        await db.execute(sql`SELECT count(*) FROM "verificationToken" LIMIT 1`);
        dbStatus.tables.verificationTokens = true;
      } catch (e) {
        dbStatus.tables.verificationTokens = false;
      }
    } catch (dbErr: any) {
      dbStatus.error = dbErr.message || "Failed to connect to Postgres/Supabase.";
    }

    // 2. Resolve & verify environment variables for social providers & auth
    const getVarStatus = (key: string, overrideVal?: string) => {
      const v = overrideVal || process.env[key];
      if (!v || v.trim().length === 0) {
        return { configured: false, status: "MISSING", preview: null };
      }
      const trimmed = v.trim();
      return {
        configured: true,
        status: "CONFIGURED",
        length: trimmed.length,
        preview: `${trimmed.substring(0, 4)}...${trimmed.substring(Math.max(0, trimmed.length - 4))}`,
      };
    };

    const googleId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || env.AUTH_GOOGLE_ID;
    const googleSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || env.AUTH_GOOGLE_SECRET;

    const githubId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || env.AUTH_GITHUB_ID;
    const githubSecret = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || process.env.NEXT_PUBLIC_GITHUB_SECRET || env.AUTH_GITHUB_SECRET;

    const facebookId = process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID || process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || env.AUTH_FACEBOOK_ID;
    const facebookSecret = process.env.AUTH_FACEBOOK_SECRET || process.env.FACEBOOK_CLIENT_SECRET || process.env.NEXT_PUBLIC_FACEBOOK_SECRET || env.AUTH_FACEBOOK_SECRET;

    const linkedinId = process.env.AUTH_LINKEDIN_ID || process.env.LINKEDIN_CLIENT_ID || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || env.AUTH_LINKEDIN_ID;
    const linkedinSecret = process.env.AUTH_LINKEDIN_SECRET || process.env.LINKEDIN_CLIENT_SECRET || process.env.NEXT_PUBLIC_LINKEDIN_SECRET || env.AUTH_LINKEDIN_SECRET;

    const envCheck = {
      database_url: getVarStatus("DATABASE_URL"),
      auth_secret: getVarStatus("AUTH_SECRET"),
      nextauth_url: getVarStatus("NEXTAUTH_URL", process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL),
      providers: {
        google: {
          client_id: getVarStatus("AUTH_GOOGLE_ID", googleId),
          client_secret: getVarStatus("AUTH_GOOGLE_SECRET", googleSecret),
          ready: Boolean(googleId && googleSecret && googleId.trim().length > 0 && googleSecret.trim().length > 0),
        },
        github: {
          client_id: getVarStatus("AUTH_GITHUB_ID", githubId),
          client_secret: getVarStatus("AUTH_GITHUB_SECRET", githubSecret),
          ready: Boolean(githubId && githubSecret && githubId.trim().length > 0 && githubSecret.trim().length > 0),
        },
        facebook: {
          client_id: getVarStatus("AUTH_FACEBOOK_ID", facebookId),
          client_secret: getVarStatus("AUTH_FACEBOOK_SECRET", facebookSecret),
          ready: Boolean(facebookId && facebookSecret && facebookId.trim().length > 0 && facebookSecret.trim().length > 0),
        },
        linkedin: {
          client_id: getVarStatus("AUTH_LINKEDIN_ID", linkedinId),
          client_secret: getVarStatus("AUTH_LINKEDIN_SECRET", linkedinSecret),
          ready: Boolean(linkedinId && linkedinSecret && linkedinId.trim().length > 0 && linkedinSecret.trim().length > 0),
        },
      },
    };

    return apiSuccess({
      status: dbStatus.connected ? "HEALTHY" : "DATABASE_ERROR",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: envCheck,
    });
  } catch (error: any) {
    return apiError(error.message || "Health check failed", 500);
  }
}

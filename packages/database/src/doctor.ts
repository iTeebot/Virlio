import dns from "dns";
import net from "net";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust multi-path env file resolution
const possibleEnvPaths = [
  path.resolve(__dirname, "../../../apps/web/.env"),
  path.resolve(__dirname, "../../../apps/web/.env.local"),
  path.resolve(__dirname, "../../../../apps/web/.env"),
  path.resolve(process.cwd(), "apps/web/.env"),
  path.resolve(process.cwd(), "../apps/web/.env"),
  path.resolve(process.cwd(), "../../apps/web/.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

interface ParsedDbUrl {
  name: string;
  raw: string;
  protocol: string;
  hostname: string;
  port: number;
  database: string;
  username: string;
  isPlaceholder: boolean;
  placeholderReason?: string;
}

const PLACEHOLDER_PATTERNS = [
  /aws-0-region/i,
  /your_host/i,
  /your_project/i,
  /your_password/i,
  /your_region/i,
  /example\.com/i,
  /<set_from_/i,
];

function parseDbUrl(name: string, urlString?: string): ParsedDbUrl | null {
  if (!urlString || urlString.trim().length === 0) return null;

  try {
    const parsed = new URL(urlString.trim());
    const hostname = parsed.hostname;
    let isPlaceholder = false;
    let placeholderReason: string | undefined = undefined;

    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(hostname) || pattern.test(urlString)) {
        isPlaceholder = true;
        placeholderReason = `Hostname '${hostname}' contains a template placeholder pattern (${pattern.source}).`;
        break;
      }
    }

    return {
      name,
      raw: urlString,
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      database: parsed.pathname.replace(/^\//, "") || "postgres",
      username: parsed.username || "postgres",
      isPlaceholder,
      placeholderReason,
    };
  } catch (err: any) {
    return {
      name,
      raw: urlString,
      protocol: "unknown",
      hostname: "unparseable",
      port: 5432,
      database: "unknown",
      username: "unknown",
      isPlaceholder: true,
      placeholderReason: `Invalid connection URL format: ${err.message}`,
    };
  }
}

async function checkDns(hostname: string): Promise<boolean> {
  try {
    await dns.promises.lookup(hostname);
    return true;
  } catch {
    return false;
  }
}

async function checkTcp(host: string, port: number, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeoutMs);
    socket.on("connect", () => {
      status = true;
      socket.destroy();
    });
    socket.on("error", () => {
      socket.destroy();
    });
    socket.on("timeout", () => {
      socket.destroy();
    });
    socket.on("close", () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

async function runDoctor() {
  console.log("\n==========================================");
  console.log("   Virlio Database & Infrastructure Doctor ");
  console.log("==========================================\n");

  const dbUrl = parseDbUrl("DATABASE_URL", process.env.DATABASE_URL);
  const directUrl = parseDbUrl("DIRECT_DATABASE_URL", process.env.DIRECT_DATABASE_URL);

  let hasErrors = false;

  // 1. Diagnostics Output (SAFE REDACTED)
  console.log("── Safe Environment Diagnostics ──");
  if (dbUrl) {
    console.log(`[DATABASE_URL]`);
    console.log(`  Protocol: ${dbUrl.protocol}`);
    console.log(`  Hostname: ${dbUrl.hostname}`);
    console.log(`  Port:     ${dbUrl.port}`);
    console.log(`  Database: ${dbUrl.database}`);
    console.log(`  Username: ${dbUrl.username}`);
  } else {
    console.log(`[FAIL] DATABASE_URL is MISSING.`);
    hasErrors = true;
  }

  console.log("");
  if (directUrl) {
    console.log(`[DIRECT_DATABASE_URL]`);
    console.log(`  Protocol: ${directUrl.protocol}`);
    console.log(`  Hostname: ${directUrl.hostname}`);
    console.log(`  Port:     ${directUrl.port}`);
    console.log(`  Database: ${directUrl.database}`);
    console.log(`  Username: ${directUrl.username}`);
  } else {
    console.log(`[FAIL] DIRECT_DATABASE_URL is MISSING.`);
    hasErrors = true;
  }
  console.log("──────────────────────────────────────────\n");

  // 2. Placeholder Check
  if (directUrl && directUrl.isPlaceholder) {
    console.log(`[FAIL] DIRECT_DATABASE_URL`);
    console.log(`Reason: ${directUrl.placeholderReason}`);
    console.log(`Fix: Set DIRECT_DATABASE_URL in apps/web/.env to the actual direct PostgreSQL connection string from your Supabase Connect panel (e.g. db.<project-ref>.supabase.co or direct pooler host).\n`);
    hasErrors = true;
  }

  if (dbUrl && dbUrl.isPlaceholder) {
    console.log(`[FAIL] DATABASE_URL`);
    console.log(`Reason: ${dbUrl.placeholderReason}`);
    console.log(`Fix: Set DATABASE_URL in apps/web/.env to the transaction pooler connection string from your Supabase Connect panel.\n`);
    hasErrors = true;
  }

  // 3. DNS Resolution Checks
  if (dbUrl && !dbUrl.isPlaceholder) {
    const dnsOk = await checkDns(dbUrl.hostname);
    if (dnsOk) {
      console.log(`[PASS] DATABASE_URL hostname '${dbUrl.hostname}' resolves via DNS.`);
    } else {
      console.log(`[FAIL] DATABASE_CONNECTION_ERROR — DNS resolution failed for DATABASE_URL hostname '${dbUrl.hostname}'.`);
      hasErrors = true;
    }
  }

  if (directUrl && !directUrl.isPlaceholder) {
    const dnsOk = await checkDns(directUrl.hostname);
    if (dnsOk) {
      console.log(`[PASS] DIRECT_DATABASE_URL hostname '${directUrl.hostname}' resolves via DNS.`);
    } else {
      console.log(`[FAIL] DATABASE_CONNECTION_ERROR — DNS resolution failed for DIRECT_DATABASE_URL hostname '${directUrl.hostname}'.`);
      hasErrors = true;
    }
  }

  // 4. TCP Socket Checks
  if (dbUrl && !dbUrl.isPlaceholder) {
    const tcpOk = await checkTcp(dbUrl.hostname, dbUrl.port);
    if (tcpOk) {
      console.log(`[PASS] DATABASE_URL TCP connection succeeded (${dbUrl.hostname}:${dbUrl.port}).`);
    } else {
      console.log(`[FAIL] DATABASE_CONNECTION_ERROR — TCP connection refused or timed out at ${dbUrl.hostname}:${dbUrl.port}.`);
      hasErrors = true;
    }
  }

  if (directUrl && !directUrl.isPlaceholder) {
    const tcpOk = await checkTcp(directUrl.hostname, directUrl.port);
    if (tcpOk) {
      console.log(`[PASS] DIRECT_DATABASE_URL TCP connection succeeded (${directUrl.hostname}:${directUrl.port}).`);
    } else {
      console.log(`[FAIL] DATABASE_CONNECTION_ERROR — TCP connection refused or timed out at ${directUrl.hostname}:${directUrl.port}.`);
      hasErrors = true;
    }
  }

  // 5. Postgres Connection & Schema Verification
  if (dbUrl && !dbUrl.isPlaceholder) {
    let client: postgres.Sql | null = null;
    try {
      client = postgres(dbUrl.raw, { prepare: false, connect_timeout: 5 });
      const res = await client`SELECT current_database() as db_name, current_user as user_name`;
      const row = res[0];
      console.log(`[PASS] DATABASE_URL PostgreSQL authentication succeeded. Database: '${row.db_name}', User: '${row.user_name}'.`);

      // Check required Auth.js tables
      const tablesCheck = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('users', 'accounts', 'sessions', 'verificationToken');
      `;
      const tableNames = tablesCheck.map((t: any) => t.table_name);

      const requiredTables = ["users", "accounts", "sessions", "verificationToken"];
      let allTablesExist = true;

      for (const reqTable of requiredTables) {
        if (tableNames.includes(reqTable)) {
          console.log(`  [PASS] Required table '${reqTable}' exists in PostgreSQL.`);
        } else {
          console.log(`  [FAIL] Required table '${reqTable}' MISSING in PostgreSQL.`);
          allTablesExist = false;
          hasErrors = true;
        }
      }

      if (!allTablesExist) {
        console.log(`\nFix: Run database schema sync: 'pnpm dlx dotenv-cli -e apps/web/.env -- pnpm --filter @virlio/database db:push'\n`);
      }
    } catch (err: any) {
      console.log(`[FAIL] DATABASE_URL PostgreSQL query failed: ${err.message}`);
      hasErrors = true;
    } finally {
      if (client) await client.end();
    }
  }

  console.log("\n==========================================");
  if (hasErrors) {
    console.log("   Status: UNHEALTHY / ACTION REQUIRED");
    console.log("==========================================\n");
    process.exit(1);
  } else {
    console.log("   Status: HEALTHY / ALL CHECKS PASSED");
    console.log("==========================================\n");
    process.exit(0);
  }
}

runDoctor().catch((err) => {
  console.error("Doctor diagnostic failed:", err.message);
  process.exit(1);
});

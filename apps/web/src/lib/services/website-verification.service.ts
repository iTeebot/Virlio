import dns from "dns";

export type VerificationMethod = "dns_txt" | "html_meta";

export interface DomainProviderInfo {
  name: string;
  instructions: string[];
}

export interface WebsiteVerificationResult {
  verified: boolean;
  method: VerificationMethod | null;
  verifiedAt: string | null;
  domain: string;
  token: string;
  provider: DomainProviderInfo;
  error?: string;
}

export function normalizeDomain(urlOrDomain: string): { fullUrl: string; hostname: string } {
  let clean = urlOrDomain.trim();
  if (!clean) return { fullUrl: "", hostname: "" };
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  try {
    const parsed = new URL(clean);
    return {
      fullUrl: parsed.origin,
      hostname: parsed.hostname.toLowerCase().replace(/^www\./, ""),
    };
  } catch (err) {
    return { fullUrl: "", hostname: "" };
  }
}

export function generateVerificationToken(hostname: string): string {
  // Deterministic token based on hostname or static prefix for consistency
  let hash = 0;
  for (let i = 0; i < hostname.length; i++) {
    hash = (hash << 5) - hash + hostname.charCodeAt(i);
    hash |= 0;
  }
  const cleanHash = Math.abs(hash).toString(36);
  return `virlio_verif_${cleanHash}_${hostname.replace(/[^a-z0-9]/g, "")}`;
}

export async function detectDNSProvider(hostname: string): Promise<DomainProviderInfo> {
  try {
    const nsRecords = await dns.promises.resolveNs(hostname).catch(() => []);
    const nsString = nsRecords.join(" ").toLowerCase();

    if (nsString.includes("cloudflare")) {
      return {
        name: "Cloudflare",
        instructions: [
          "Log in to your Cloudflare Dashboard.",
          "Select your domain and navigate to DNS -> Records.",
          "Click 'Add Record', choose Type 'TXT', set Name to '@' (or root domain).",
          "Paste the verification value below into Content and click Save.",
          "Return here and click 'Verify Again'.",
        ],
      };
    }

    if (nsString.includes("registrar-servers") || nsString.includes("namecheap")) {
      return {
        name: "Namecheap",
        instructions: [
          "Log in to Namecheap and go to Domain List.",
          "Click 'Manage' next to your domain and open Advanced DNS.",
          "Click 'Add New Record', select 'TXT Record'.",
          "Set Host to '@' and paste the verification value into Value.",
          "Save changes, return here, and click 'Verify Again'.",
        ],
      };
    }

    if (nsString.includes("domaincontrol") || nsString.includes("godaddy")) {
      return {
        name: "GoDaddy",
        instructions: [
          "Log in to your GoDaddy Domain Portfolio.",
          "Select your domain and open DNS Management.",
          "Click 'Add', select Type 'TXT', Name '@'.",
          "Paste the verification token into Value and Save.",
          "Return here and click 'Verify Again'.",
        ],
      };
    }

    if (nsString.includes("hostinger")) {
      return {
        name: "Hostinger",
        instructions: [
          "Log in to hPanel and open DNS Zone Editor.",
          "Choose Type 'TXT', set Name to '@'.",
          "Paste the token into TXT Value and click Add Record.",
          "Return here and click 'Verify Again'.",
        ],
      };
    }

    if (nsString.includes("vercel")) {
      return {
        name: "Vercel DNS",
        instructions: [
          "Open your Vercel Project Settings -> Domains.",
          "Select Domain DNS Records.",
          "Add TXT Record with Name '@' and paste token value.",
          "Return here and click 'Verify Again'.",
        ],
      };
    }

    if (nsString.includes("awsdns")) {
      return {
        name: "AWS Route 53",
        instructions: [
          "Open AWS Route 53 Hosted Zones.",
          "Create Record -> Choose Record Type 'TXT'.",
          "Paste token enclosed in quotes into Value.",
          "Return here and click 'Verify Again'.",
        ],
      };
    }

    if (nsString.includes("digitalocean")) {
      return {
        name: "DigitalOcean",
        instructions: [
          "Go to DigitalOcean Networking -> Domains.",
          "Add TXT Record with Host '@' and token value.",
          "Return here and click 'Verify Again'.",
        ],
      };
    }
  } catch (err) {}

  return {
    name: "Generic DNS Provider",
    instructions: [
      "Log in to your domain registrar or DNS hosting dashboard.",
      "Navigate to DNS Settings / Record Management.",
      "Add a new TXT record with Name '@' (or root domain).",
      "Paste the verification token into the Value / Content field.",
      "Save changes, return here, and click 'Verify Again'.",
    ],
  };
}

export async function checkDNSOwnership(hostname: string, token: string): Promise<boolean> {
  // 1. Instant Google DNS over HTTPS Probe (bypasses OS DNS TTL caching)
  try {
    const googleRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (googleRes.ok) {
      const json = await googleRes.json();
      if (json.Answer && Array.isArray(json.Answer)) {
        for (const ans of json.Answer) {
          const dataStr = String(ans.data || "");
          if (dataStr.includes(token)) return true;
        }
      }
    }
  } catch (err) {}

  // 2. Instant Cloudflare DNS over HTTPS Probe
  try {
    const cfRes = await fetch(`https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(4000),
    });
    if (cfRes.ok) {
      const json = await cfRes.json();
      if (json.Answer && Array.isArray(json.Answer)) {
        for (const ans of json.Answer) {
          const dataStr = String(ans.data || "");
          if (dataStr.includes(token)) return true;
        }
      }
    }
  } catch (err) {}

  // 3. Fallback: OS Node DNS Resolver
  try {
    const txtRecords = await dns.promises.resolveTxt(hostname);
    for (const recordArray of txtRecords) {
      const combined = recordArray.join("");
      if (combined.includes(token) || combined.includes(`virlio-site-verification=${token}`)) {
        return true;
      }
    }
  } catch (err) {}

  return false;
}

export async function checkHTMLMetaOwnership(fullUrl: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(fullUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const html = await res.text();
      // Match <meta name="virlio-site-verification" content="TOKEN">
      const metaRegex = /<meta[^>]*name=["']virlio-site-verification["'][^>]*content=["']([^"']+)["']/i;
      const match = metaRegex.exec(html);
      if (match && match[1] && (match[1] === token || match[1].includes(token))) {
        return true;
      }
    }
  } catch (err) {}
  return false;
}

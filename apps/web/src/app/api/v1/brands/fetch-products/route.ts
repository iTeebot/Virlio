import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";

/**
 * Recursive JSON scanner that traverses any e-commerce JSON payload (Shopify, Custom Next.js, WooCommerce, Strapi)
 * and extracts product names/titles.
 */
function extractTitlesFromJSON(obj: any, titlesSet: Set<string>) {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractTitlesFromJSON(item, titlesSet);
    }
    return;
  }

  // Check if current object has a product title/name field
  const possibleName = obj.title || obj.name || obj.product_name || obj.productTitle;
  if (typeof possibleName === "string" && possibleName.trim().length > 2) {
    const cleanName = possibleName.trim();
    // Filter out top-level category titles if they are generic single words like "Jackets" or "T-Shirts" when full product titles exist
    if (
      cleanName.length <= 60 &&
      !/^(jackets|shirts|t-shirts|pants|shoes|accessories|categories|all|products|items|shop)$/i.test(cleanName)
    ) {
      titlesSet.add(cleanName);
    }
  }

  // Traverse nested arrays/objects (e.g. categories, products, items, data, results)
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      extractTitlesFromJSON(obj[key], titlesSet);
    }
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "URL parameter is required" }, { status: 400 });
    }

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const parsedUrl = new URL(url);
    const origin = parsedUrl.origin;

    const extractedProducts = new Set<string>();

    // 1. Try Specific Endpoints & Direct URL for JSON payload
    const jsonEndpoints = [
      url.endsWith(".json") ? url : null,
      `${url.replace(/\/$/, "")}.json`,
      `${origin}/products.json?limit=50`,
      `${origin}/collections/all/products.json?limit=50`,
      `${origin}/api/products`,
      `${origin}/api/v1/products`,
    ].filter(Boolean) as string[];

    for (const endpoint of jsonEndpoints) {
      try {
        const res = await fetch(endpoint, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json") || endpoint.endsWith(".json")) {
            const json = await res.json();
            extractTitlesFromJSON(json, extractedProducts);
          }
        }
      } catch (err) {
        // Silently try next endpoint
      }

      if (extractedProducts.size >= 5) break;
    }

    // 2. Fallback: Multi-Layer HTML Crawler
    if (extractedProducts.size === 0) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const html = await res.text();

          // Layer A: Schema.org JSON-LD (@type: "Product" or ItemList)
          const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
          let match;
          while ((match = jsonLdRegex.exec(html)) !== null) {
            try {
              const ldData = JSON.parse(match[1]);
              extractTitlesFromJSON(ldData, extractedProducts);
            } catch (err) {}
          }

          // Layer B: Product Link Anchors (e.g. href="/products/...")
          if (extractedProducts.size < 5) {
            const productLinkRegex = /<a[^>]*href=["'][^"']*\/(?:products|item|shop|product|p)\/([^"'\?#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            while ((match = productLinkRegex.exec(html)) !== null) {
              const rawSlug = match[1];
              const linkInner = match[2].replace(/<[^>]+>/g, " ").trim();

              if (linkInner && linkInner.length >= 3 && linkInner.length <= 60 && !/view|detail|buy|shop|cart|add/i.test(linkInner)) {
                extractedProducts.add(linkInner);
              } else if (rawSlug) {
                const formattedFromSlug = rawSlug
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");
                if (formattedFromSlug.length >= 3 && formattedFromSlug.length <= 50) {
                  extractedProducts.add(formattedFromSlug);
                }
              }
            }
          }

          // Layer C: Product Card Heading Selectors
          if (extractedProducts.size < 5) {
            const cardRegex = /<(?:h2|h3|h4|span|div)[^>]*class=["'][^"']*(?:product|item|card|title)[^"']*["'][^>]*>([^<]{3,60})<\/(?:h2|h3|h4|span|div)>/gi;
            while ((match = cardRegex.exec(html)) !== null) {
              const text = match[1].trim();
              if (text && !/filter|sort|search|menu|cart|login|privacy|terms|copyright/i.test(text)) {
                extractedProducts.add(text);
              }
            }
          }
        }
      } catch (err) {
        console.warn("[fetch-products] HTML fetch error:", err);
      }
    }

    const productList = Array.from(extractedProducts).slice(0, 50);

    if (productList.length === 0) {
      return NextResponse.json({
        data: { products: [] },
        message: `No product items could be extracted automatically from ${parsedUrl.hostname}. Note: Experimental feature — client-rendered JavaScript apps or protected stores may require manual entry.`,
      });
    }

    return NextResponse.json({
      data: { products: productList },
      message: `Successfully crawled and extracted ${productList.length} product(s) from ${parsedUrl.hostname}!`,
    });
  } catch (error: any) {
    console.error("Fetch products API error:", error);
    return NextResponse.json({ message: error.message || "Failed to crawl products from URL" }, { status: 500 });
  }
}

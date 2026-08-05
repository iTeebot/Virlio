import sharp from "sharp";
import fs from "fs";
import path from "path";
import { uploadImage } from "../storage.service";

/**
 * Escapes special HTML/XML characters to prevent SVG parsing errors.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Wraps text into multiple lines based on a maximum character count per line.
 */
function wrapText(text: string, maxCharsPerLine: number = 32): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export interface RenderMemeOptions {
  templateImageUrl: string;
  topText?: string | null;
  bottomText?: string | null;
  regionCaptions?: Record<string, string> | null;
  textLayout?: string;
  watermarkEnabled?: boolean;
  regions?: any[] | null; // Bounding box coordinate regions
}

/**
 * Server-side Meme Rendering Service.
 *
 * Securely composites text overlays (both classic Top/Bottom and Coordinate-Based Region Labeling)
 * and the Virlio watermark onto a template image using Sharp.
 */
export async function renderMemeImage(options: RenderMemeOptions): Promise<Buffer> {
  const {
    templateImageUrl,
    topText = "",
    bottomText = "",
    regionCaptions = null,
    textLayout = "top_bottom",
    watermarkEnabled = true,
    regions = null,
  } = options;

  // 1. Fetch template image buffer
  const imageResponse = await fetch(templateImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch template image: ${imageResponse.statusText}`);
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  // 2. Load Sharp instance & metadata
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 600;
  const height = metadata.height || 600;

  // Base font size scaling (7.5% of width)
  let fontSize = Math.max(20, Math.min(80, Math.round(width * 0.075)));

  // Generate SVG text elements
  let textElements = "";

  if (textLayout === "regions" && regions && Array.isArray(regions)) {
    // --- COORDINATE-BASED REGION LABELING LAYOUT ---
    const captions = regionCaptions || {};
    
    textElements = regions
      .map((region: any) => {
        const textVal = captions[region.id] || "";
        if (!textVal.trim()) return "";

        // Calculate absolute coordinates inside canvas
        const cx = (width * region.x) / 100;
        const cy = (height * region.y) / 100;
        const boxW = (width * region.width) / 100;

        // Wrap text
        const maxChars = Math.max(10, Math.round(boxW / (fontSize * 0.55)));
        const lines = wrapText(textVal, maxChars);

        // Apply scale/rotation overlays
        const rFontSize = Math.round(fontSize * (region.fontSizeFactor || 1.0));
        const rLineHeight = rFontSize * 1.15;
        const rStrokeWidth = Math.max(2, Math.round(rFontSize * 0.18));

        // Center block vertically relative to region CY
        const totalH = (lines.length - 1) * rLineHeight + rFontSize;
        const startY = cy - totalH / 2 + rFontSize / 3;

        // Render tspans centered at CX.
        // Double-render text elements to draw black outline underneath and clean white text on top.
        const tspans = lines
          .map((line, idx) => {
            const y = startY + idx * rLineHeight;
            const escaped = escapeHtml(line);
            return `
              <text x="${cx}" y="${y}" fill="none" stroke="black" stroke-width="${rStrokeWidth}px" stroke-linejoin="round" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${rFontSize}px; text-transform: uppercase;">${escaped}</text>
              <text x="${cx}" y="${y}" fill="white" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${rFontSize}px; text-transform: uppercase;">${escaped}</text>
            `;
          })
          .join("\n");

        if (region.angle) {
          return `<g transform="rotate(${region.angle}, ${cx}, ${cy})">${tspans}</g>`;
        }
        return tspans;
      })
      .join("\n");
  } else {
    // --- CLASSIC TOP / BOTTOM / MIDDLE LAYOUTS ---
    const rawTop = (topText || "").trim();
    const rawBottom = (bottomText || "").trim();

    let topLines: string[] = [];
    let bottomLines: string[] = [];
    let middleLines: string[] = [];

    const maxChars = Math.max(20, Math.round(width / 18));

    if (textLayout === "top_only") {
      topLines = wrapText(rawTop || rawBottom, maxChars);
    } else if (textLayout === "bottom_only") {
      bottomLines = wrapText(rawBottom || rawTop, maxChars);
    } else if (textLayout === "top_bottom") {
      topLines = wrapText(rawTop, maxChars);
      bottomLines = wrapText(rawBottom, maxChars);
    } else if (textLayout === "top_middle") {
      topLines = wrapText(rawTop, maxChars);
      middleLines = wrapText(rawBottom, maxChars);
    } else if (textLayout === "middle_only") {
      middleLines = wrapText(rawTop || rawBottom, maxChars);
    }

    const longestLine = Math.max(
      ...[...topLines, ...bottomLines, ...middleLines].map((l) => l.length),
      10
    );
    
    if (longestLine > 18) {
      fontSize = Math.max(16, Math.round(fontSize * (18 / longestLine)));
    }

    const strokeWidth = Math.max(2, Math.round(fontSize * 0.18));
    const lineHeight = Math.round(fontSize * 1.15);
    const yPadding = Math.max(12, Math.min(32, Math.round(height * 0.04)));

    // Double render for crisp outline placement
    if (topLines.length > 0) {
      textElements += topLines
        .map((line, index) => {
          const y = yPadding + fontSize + index * lineHeight;
          const escaped = escapeHtml(line);
          return `
            <text x="${width / 2}" y="${y}" fill="none" stroke="black" stroke-width="${strokeWidth}px" stroke-linejoin="round" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${fontSize}px; text-transform: uppercase;">${escaped}</text>
            <text x="${width / 2}" y="${y}" fill="white" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${fontSize}px; text-transform: uppercase;">${escaped}</text>
          `;
        })
        .join("\n");
    }

    if (middleLines.length > 0) {
      const totalMiddleHeight = (middleLines.length - 1) * lineHeight + fontSize;
      const startY = height / 2 - totalMiddleHeight / 2 + fontSize / 3;
      textElements += middleLines
        .map((line, index) => {
          const y = startY + index * lineHeight;
          const escaped = escapeHtml(line);
          return `
            <text x="${width / 2}" y="${y}" fill="none" stroke="black" stroke-width="${strokeWidth}px" stroke-linejoin="round" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${fontSize}px; text-transform: uppercase;">${escaped}</text>
            <text x="${width / 2}" y="${y}" fill="white" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${fontSize}px; text-transform: uppercase;">${escaped}</text>
          `;
        })
        .join("\n");
    }

    if (bottomLines.length > 0) {
      textElements += bottomLines
        .map((line, index) => {
          const y = height - yPadding - (bottomLines.length - 1 - index) * lineHeight;
          const escaped = escapeHtml(line);
          return `
            <text x="${width / 2}" y="${y}" fill="none" stroke="black" stroke-width="${strokeWidth}px" stroke-linejoin="round" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${fontSize}px; text-transform: uppercase;">${escaped}</text>
            <text x="${width / 2}" y="${y}" fill="white" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="900" style="font-size: ${fontSize}px; text-transform: uppercase;">${escaped}</text>
          `;
        })
        .join("\n");
    }
  }

  // Build complete SVG overlay
  const textSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${textElements}
    </svg>
  `;

  // 5. Compositing array
  const compositeLayers: any[] = [];

  // Add text layer
  if (textLayout !== "no_text") {
    compositeLayers.push({
      input: Buffer.from(textSvg),
      top: 0,
      left: 0,
    });
  }

  // Add watermark layer
  if (watermarkEnabled) {
    const watermarkPath = path.join(process.cwd(), "public/images/watermark.png");
    if (fs.existsSync(watermarkPath)) {
      const watermarkSize = Math.max(32, Math.min(64, Math.round(width * 0.1)));
      const watermarkBuffer = fs.readFileSync(watermarkPath);

      const resizedWatermark = await sharp(watermarkBuffer)
        .resize(watermarkSize, watermarkSize)
        .toBuffer();

      compositeLayers.push({
        input: resizedWatermark,
        top: height - watermarkSize - 16,
        left: width - watermarkSize - 16,
        blend: "over",
      });
    }
  }

  // 6. Perform rendering composition
  return image.composite(compositeLayers).png().toBuffer();
}

/**
 * Renders a meme and uploads it to Cloudinary.
 */
export async function renderAndUploadMeme(
  options: RenderMemeOptions & { brandId: string }
): Promise<{ cloudinary_secure_url: string; cloudinary_public_id: string }> {
  // If regions layout and regions array not passed, fetch it from DB templates
  if (options.textLayout === "regions" && !options.regions) {
    try {
      const { db } = await import("@virlio/database");
      const { templates: templatesTable } = await import("@virlio/database/schema");
      const { eq } = await import("drizzle-orm");

      const tpl = await db.query.templates.findFirst({
        where: eq(templatesTable.cloudinary_secure_url, options.templateImageUrl),
      });

      if (tpl && tpl.ai_generation_profile) {
        options.regions = (tpl.ai_generation_profile as any).regions || null;
      }
    } catch (err) {
      console.warn("[Meme Renderer] Could not fetch regions profile dynamically:", err);
    }
  }

  const renderedBuffer = await renderMemeImage(options);
  const folder = `brands/${options.brandId}/memes`;
  const uploadResult = await uploadImage(renderedBuffer, folder);

  return {
    cloudinary_secure_url: uploadResult.secure_url,
    cloudinary_public_id: uploadResult.public_id,
  };
}

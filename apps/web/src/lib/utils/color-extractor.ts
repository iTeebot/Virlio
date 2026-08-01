/**
 * Client-side color extractor that analyzes an image URL using HTML5 Canvas
 * and returns 5 solid color tokens for brand identity.
 */
export async function extractColorsFromImage(imageUrl: string): Promise<{
  primary: string;
  secondary: string;
  accent: string;
  darkBackground: string;
  lightBackground: string;
}> {
  return new Promise((resolve) => {
    // Default fallback palette if image loading or canvas fails
    const fallback = {
      primary: "#2563EB",
      secondary: "#1E40AF",
      accent: "#3B82F6",
      darkBackground: "#0F172A",
      lightBackground: "#F8FAFC",
    };

    if (!imageUrl) return resolve(fallback);

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(fallback);

        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imgData = ctx.getImageData(0, 0, 100, 100).data;
        const colorCounts: Record<string, number> = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip transparent or near-white/near-black background pixels for primary selection
          if (a < 128) continue;
          if (r > 245 && g > 245 && b > 245) continue;
          if (r < 10 && g < 10 && b < 10) continue;

          // Quantize color to 16-bit buckets
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1).toUpperCase()}`;

          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

        const primary = sortedColors[0] || "#2563EB";
        const secondary = sortedColors[1] || adjustBrightness(primary, -30);
        const accent = sortedColors[2] || adjustBrightness(primary, 40);

        resolve({
          primary,
          secondary,
          accent,
          darkBackground: "#0F172A",
          lightBackground: "#F8FAFC",
        });
      } catch (err) {
        resolve(fallback);
      }
    };

    img.onerror = () => resolve(fallback);
    img.src = imageUrl;
  });
}

function adjustBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace("#", ""), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
}

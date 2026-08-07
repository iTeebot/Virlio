/**
 * Cloudinary Native Transformation Helpers
 */

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
    quality?: "auto" | "auto:good" | "auto:best" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  } = {}
) {
  if (!publicIdOrUrl) return "";
  if (!publicIdOrUrl.includes("res.cloudinary.com")) return publicIdOrUrl;

  const width = options.width ? `w_${options.width}` : "";
  const height = options.height ? `h_${options.height}` : "";
  const crop = options.crop ? `c_${options.crop}` : "c_fill";
  const quality = options.quality ? `q_${options.quality}` : "q_auto";
  const format = options.format ? `f_${options.format}` : "f_auto";

  const transformations = [format, quality, crop, width, height].filter(Boolean).join(",");

  // Prevent duplicate transformation strings
  if (publicIdOrUrl.includes(`/upload/${transformations}/`)) {
    return publicIdOrUrl;
  }

  return publicIdOrUrl.replace(/\/upload\/(v\d+\/)?/, `/upload/${transformations}/$1`);
}

export function getAvatarUrl(url: string, size: number = 64) {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
}

export function getMemeFeedUrl(url: string, width: number = 600) {
  return getOptimizedImageUrl(url, {
    width,
    crop: "scale",
    quality: "auto",
    format: "auto",
  });
}

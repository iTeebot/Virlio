import { cloudinary } from "./client";

export function getOptimizedImageUrl(publicId: string, options: any = {}) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  });
}

export function getThumbnailUrl(publicId: string, size: number = 150) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    width: size,
    height: size,
    crop: "fill",
  });
}

export function getResponsiveUrl(publicId: string, breakpoints: number[] = [320, 640, 768, 1024, 1280]) {
  return breakpoints
    .map((bp) => {
      const url = cloudinary.url(publicId, { width: bp, fetch_format: "auto", quality: "auto" });
      return `${url} ${bp}w`;
    })
    .join(", ");
}

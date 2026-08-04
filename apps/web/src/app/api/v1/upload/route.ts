import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";
import { uploadBufferToCloudinary } from "@/lib/cloudinary/upload";
import { cloudinary } from "@/lib/cloudinary/client";

// Internal server-only mapping of abstract asset types to secure storage folders
function resolveServerFolder(rawAssetType?: string, rawFolder?: string): string {
  if (rawAssetType === "avatar") return "virlio/user-avatars";
  if (rawAssetType === "brand") return "virlio/brand-logos";
  if (rawAssetType === "template") return "virlio/template-assets";
  if (rawAssetType === "verification") return "virlio/verification-proofs";
  if (rawFolder && rawFolder.startsWith("virlio/")) return rawFolder;
  return "virlio/uploads";
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const assetType = (formData.get("assetType") as string) || "";
      const folder = resolveServerFolder(assetType, formData.get("folder") as string);

      if (!file) {
        return NextResponse.json({ message: "No file provided" }, { status: 400 });
      }

      // File size validation (Max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "File size exceeds maximum limit of 5MB." }, { status: 400 });
      }

      // File type validation
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { message: "Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG images are supported." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadBufferToCloudinary(buffer, folder);

      // Return ONLY the public URL — never expose internal storage public_id or provider details to client
      return NextResponse.json({
        url: result.secure_url,
      });
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const { url, assetType, folder: rawFolder } = body;

      if (!url || typeof url !== "string" || !url.trim()) {
        return NextResponse.json({ message: "Valid image URL is required" }, { status: 400 });
      }

      const folder = resolveServerFolder(assetType, rawFolder);

      // Upload URL to Cloudinary
      const result = await cloudinary.uploader.upload(url.trim(), {
        folder,
        resource_type: "image",
      });

      return NextResponse.json({
        url: result.secure_url,
      });
    }

    return NextResponse.json({ message: "Unsupported Content-Type" }, { status: 400 });
  } catch (error: any) {
    console.error("[Upload Service Exception]", error);
    return NextResponse.json({ message: "Failed to upload image. Please try again." }, { status: 500 });
  }
}

#!/bin/bash

cat << 'FILE' > lib/cloudinary/client.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
FILE

cat << 'FILE' > lib/cloudinary/upload.ts
import { cloudinary } from "./client";

export async function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: string = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return { timestamp, signature, folder };
}
FILE

cat << 'FILE' > lib/cloudinary/transform.ts
import { cloudinary } from "./client";

export function getOptimizedImageUrl(publicId: string, options: any = {}) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...options
  });
}

export function getThumbnailUrl(publicId: string, size: number = 150) {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    width: size,
    height: size,
    crop: "fill"
  });
}

export function getResponsiveUrl(publicId: string, breakpoints: number[] = [320, 640, 768, 1024, 1280]) {
  // This could return a srcset string
  return breakpoints.map(bp => {
    const url = cloudinary.url(publicId, { width: bp, fetch_format: "auto", quality: "auto" });
    return \`\${url} \${bp}w\`;
  }).join(", ");
}
FILE

cat << 'FILE' > lib/cloudinary/index.ts
export * from "./client";
export * from "./upload";
export * from "./transform";
FILE

mkdir -p app/api/v1/brands app/api/v1/templates app/api/v1/memes app/api/v1/users app/api/v1/votes app/api/v1/reports app/api/v1/explore

cat << 'FILE' > app/api/v1/brands/route.ts
import { NextRequest, NextResponse } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { z } from "zod";
// Assuming there is a createBrandSchema, if not we define a dummy one
const createBrandSchema = z.object({ name: z.string(), slug: z.string(), description: z.string().optional() });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const brands = await brandService.getPublicBrands({ limit, offset });
    return NextResponse.json(apiSuccess(brands));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return NextResponse.json(apiUnauthorized(), { status: 401 });
    
    const body = await req.json();
    const parsed = createBrandSchema.parse(body);
    
    const brand = await brandService.create(session.user.id, parsed);
    return NextResponse.json(apiSuccess(brand, "Brand created successfully"));
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json(apiError(error.errors), { status: 400 });
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
FILE

cat << 'FILE' > app/api/v1/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { templateService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { z } from "zod";
const uploadTemplateSchema = z.object({ title: z.string(), slug: z.string(), category: z.string(), imageUrl: z.string() });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const query = searchParams.get("query");
    
    const templates = query 
      ? await templateService.search(query, { limit, offset })
      : await templateService.getPublicTemplates({ limit, offset });
      
    return NextResponse.json(apiSuccess(templates));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return NextResponse.json(apiUnauthorized(), { status: 401 });
    
    const body = await req.json();
    const parsed = uploadTemplateSchema.parse(body);
    
    const template = await templateService.upload(session.user.id, parsed);
    return NextResponse.json(apiSuccess(template, "Template created successfully"));
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json(apiError(error.errors), { status: 400 });
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
FILE

cat << 'FILE' > app/api/v1/memes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { memeService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { z } from "zod";
const createMemeSchema = z.object({ title: z.string().optional(), templateId: z.string(), brandId: z.string().optional(), isPublic: z.boolean().optional(), imageUrl: z.string() });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const memes = await memeService.getPublicMemes({ limit, offset });
    return NextResponse.json(apiSuccess(memes));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return NextResponse.json(apiUnauthorized(), { status: 401 });
    
    const body = await req.json();
    const parsed = createMemeSchema.parse(body);
    
    const meme = await memeService.create(session.user.id, parsed);
    return NextResponse.json(apiSuccess(meme, "Meme created successfully"));
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json(apiError(error.errors), { status: 400 });
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
FILE

cat << 'FILE' > app/api/v1/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/server/repositories";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    
    const profiles = await userRepository.findPublicProfiles({ limit, offset });
    return NextResponse.json(apiSuccess(profiles));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
FILE

cat << 'FILE' > app/api/v1/votes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { voteService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { z } from "zod";

const voteSchema = z.object({
  entityType: z.enum(["MEME", "TEMPLATE", "COMMENT"]),
  entityId: z.string(),
  voteType: z.enum(["UP", "DOWN"])
});

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return NextResponse.json(apiUnauthorized(), { status: 401 });
    
    const body = await req.json();
    const { entityType, entityId, voteType } = voteSchema.parse(body);
    
    const result = await voteService.vote(session.user.id, entityType, entityId, voteType);
    return NextResponse.json(apiSuccess(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json(apiError(error.errors), { status: 400 });
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return NextResponse.json(apiUnauthorized(), { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    
    if (!entityType || !entityId) return NextResponse.json(apiError("Missing params"), { status: 400 });
    
    await voteService.removeVote(session.user.id, entityType, entityId);
    return NextResponse.json(apiSuccess({ success: true }));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
FILE

cat << 'FILE' > app/api/v1/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { reportService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { z } from "zod";

const reportSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  reason: z.string(),
  details: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return NextResponse.json(apiUnauthorized(), { status: 401 });
    
    const body = await req.json();
    const parsed = reportSchema.parse(body);
    
    const report = await reportService.submit(session.user.id, parsed);
    return NextResponse.json(apiSuccess(report, "Report submitted successfully"));
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json(apiError(error.errors), { status: 400 });
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
FILE

cat << 'FILE' > app/api/v1/explore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exploreService } from "@/server/services";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const [
      trendingMemes,
      featuredBrands,
      popularTemplates,
      topContributors,
      recentActivity
    ] = await Promise.all([
      exploreService.getTrendingMemes(limit),
      exploreService.getFeaturedBrands(limit),
      exploreService.getPopularTemplates(limit),
      exploreService.getTopContributors(limit),
      exploreService.getRecentActivity(limit),
    ]);
    
    return NextResponse.json(apiSuccess({
      trendingMemes,
      featuredBrands,
      popularTemplates,
      topContributors,
      recentActivity
    }));
  } catch (error: any) {
    return NextResponse.json(apiError(error.message), { status: 500 });
  }
}
FILE

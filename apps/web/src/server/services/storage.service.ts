import { getOptimizedImageUrl } from "@/lib/cloudinary/transform";
import { uploadBufferToCloudinary, deleteCloudinaryAsset } from "@/lib/cloudinary/upload";

export async function uploadImage(buffer: Buffer, folder: string, entityType?: string, entityId?: string, ownerId?: string) {
  return uploadBufferToCloudinary(buffer, folder);
}

export async function deleteImage(publicId: string) {
  return deleteCloudinaryAsset(publicId);
}

export async function getOptimizedUrl(publicId: string, options?: any) {
  return getOptimizedImageUrl(publicId, options);
}

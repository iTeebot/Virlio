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

/**
 * Utility for Cloudinary uploads using the Unsigned Upload Preset.
 * This is meant to be used in client-side components.
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
}

export async function uploadToCloudinary(
  file: File,
  resourceType: "video" | "image" = "video"
): Promise<CloudinaryUploadResponse | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    console.error("Cloudinary Error: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing.");
    return null;
  }
  if (!uploadPreset) {
    console.error("Cloudinary Error: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is missing.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary API Error:", errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Cloudinary Network/Fetch Error:", error);
    return null;
  }
}

import { randomUUID } from "crypto";
import { AppError } from "@/src/types";
import { getSupabaseAdmin, getSupabaseUrl } from "@/src/lib/supabase/server";

export const CAMPAIGN_IMAGES_BUCKET = "campaign-images";
export const MAX_CAMPAIGN_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_CAMPAIGN_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedCampaignImageType = (typeof ALLOWED_CAMPAIGN_IMAGE_TYPES)[number];

export class StorageUploadError extends AppError {
  constructor(message = "Failed to upload campaign image") {
    super(message, 502, "STORAGE_UPLOAD_FAILED");
  }
}

const EXT_BY_TYPE: Record<AllowedCampaignImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isSafeStorageId(value: string): boolean {
  return /^[a-z0-9]{1,64}$/i.test(value);
}

/**
 * Detect image type from file signatures so client MIME types are not trusted.
 */
export function detectAllowedImageType(buffer: Buffer): AllowedCampaignImageType | null {
  if (buffer.length < 12) {
    return null;
  }

  // [Reason] SVG must never be accepted even if the client labels it as a raster image
  const head = buffer.subarray(0, 256).toString("utf8").trimStart();
  if (head.startsWith("<") || head.startsWith("\uFEFF<")) {
    return null;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return "image/gif";
  }

  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function validateCampaignImageBuffer(buffer: Buffer): AllowedCampaignImageType {
  if (!buffer.length) {
    throw new AppError("No file provided", 400, "VALIDATION_ERROR");
  }

  if (buffer.length > MAX_CAMPAIGN_IMAGE_BYTES) {
    throw new AppError("File is too large", 400, "VALIDATION_ERROR");
  }

  const detected = detectAllowedImageType(buffer);
  if (!detected) {
    throw new AppError("Invalid file type", 400, "VALIDATION_ERROR");
  }

  return detected;
}

export function buildCampaignImageObjectPath(
  folderId: string,
  mimeType: AllowedCampaignImageType,
  options?: { pending?: boolean }
): string {
  // [Reason] Storage paths must use generated IDs, never the original filename
  if (!isSafeStorageId(folderId)) {
    throw new AppError("Invalid campaign", 400, "VALIDATION_ERROR");
  }

  const filename = `${randomUUID()}.${EXT_BY_TYPE[mimeType]}`;
  if (options?.pending) {
    return `campaigns/pending/${folderId}/${filename}`;
  }
  return `campaigns/${folderId}/${filename}`;
}

/**
 * Map a public campaign-images URL back to its object path, or null if it is not ours.
 */
export function getCampaignImageObjectPath(imageUrl: string): string | null {
  if (!imageUrl) {
    return null;
  }

  let supabaseUrl: string;
  try {
    supabaseUrl = getSupabaseUrl();
  } catch {
    return null;
  }

  try {
    const parsed = new URL(imageUrl);
    const expected = new URL(supabaseUrl);
    if (parsed.hostname !== expected.hostname) {
      return null;
    }

    const prefix = `/storage/v1/object/public/${CAMPAIGN_IMAGES_BUCKET}/`;
    if (!parsed.pathname.startsWith(prefix)) {
      return null;
    }

    const objectPath = decodeURIComponent(parsed.pathname.slice(prefix.length));
    if (
      !objectPath ||
      objectPath.includes("..") ||
      objectPath.startsWith("/") ||
      objectPath.includes("\\")
    ) {
      return null;
    }

    return objectPath;
  } catch {
    return null;
  }
}

export function isSupabaseCampaignImageUrl(imageUrl: string): boolean {
  return getCampaignImageObjectPath(imageUrl) !== null;
}

export async function uploadCampaignImageObject(
  objectPath: string,
  buffer: Buffer,
  mimeType: AllowedCampaignImageType
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(CAMPAIGN_IMAGES_BUCKET)
    .upload(objectPath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("Campaign image upload failed");
    throw new StorageUploadError();
  }

  const { data } = supabase.storage.from(CAMPAIGN_IMAGES_BUCKET).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new StorageUploadError();
  }

  return data.publicUrl;
}

/**
 * Best-effort Storage delete. Missing objects must not fail the caller.
 */
export async function deleteCampaignImageObject(imageUrl: string): Promise<void> {
  const objectPath = getCampaignImageObjectPath(imageUrl);
  if (!objectPath) {
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(CAMPAIGN_IMAGES_BUCKET).remove([objectPath]);
    if (error) {
      console.error("Campaign image storage delete failed");
    }
  } catch {
    console.error("Campaign image storage delete failed");
  }
}

export async function deleteCampaignImageObjects(imageUrls: string[]): Promise<void> {
  const unique = [...new Set(imageUrls.filter(Boolean))];
  await Promise.all(unique.map((url) => deleteCampaignImageObject(url)));
}

/**
 * A business may remove objects under its pending folder or a campaign it owns.
 */
export function isOwnedPendingObjectPath(objectPath: string, businessId: string): boolean {
  if (!isSafeStorageId(businessId)) {
    return false;
  }
  const prefix = `campaigns/pending/${businessId}/`;
  if (!objectPath.startsWith(prefix)) {
    return false;
  }
  const rest = objectPath.slice(prefix.length);
  return Boolean(rest) && !rest.includes("/") && !rest.includes("..");
}

export function parseOwnedCampaignObjectPath(objectPath: string): string | null {
  const match = objectPath.match(/^campaigns\/([a-z0-9]{1,64})\/[^/]+$/i);
  if (!match || match[1].toLowerCase() === "pending") {
    return null;
  }
  return match[1];
}

export function publicUrlForObjectPath(objectPath: string): string | null {
  const { data } = getSupabaseAdmin().storage.from(CAMPAIGN_IMAGES_BUCKET).getPublicUrl(objectPath);
  return data?.publicUrl ?? null;
}

/**
 * Copy a pending object to campaigns/<campaignId>/ without deleting the source.
 * Returns the new public URL, or null so the caller can keep the pending URL.
 */
export async function copyPendingCampaignImageToCampaign(
  pendingUrl: string,
  campaignId: string,
  businessId: string
): Promise<string | null> {
  const fromPath = getCampaignImageObjectPath(pendingUrl);
  if (!fromPath || !isOwnedPendingObjectPath(fromPath, businessId) || !isSafeStorageId(campaignId)) {
    return null;
  }

  const filename = fromPath.split("/").pop();
  if (!filename || filename.includes("..")) {
    return null;
  }

  const toPath = `campaigns/${campaignId}/${filename}`;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(CAMPAIGN_IMAGES_BUCKET).copy(fromPath, toPath);
    if (error) {
      console.error("Campaign image finalize copy failed");
      return null;
    }
    return publicUrlForObjectPath(toPath);
  } catch {
    console.error("Campaign image finalize copy failed");
    return null;
  }
}

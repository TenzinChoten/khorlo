import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { saveUpload } from "@/src/lib/uploads";
import { AppError, ForbiddenError, NotFoundError } from "@/src/types";
import { handleApiError } from "@/src/utils/api-error-handler";
import { businessRepository } from "@/src/repositories/business.repository";
import { campaignRepository } from "@/src/repositories/campaign.repository";
import {
  MAX_CAMPAIGN_IMAGE_BYTES,
  buildCampaignImageObjectPath,
  deleteCampaignImageObject,
  getCampaignImageObjectPath,
  isOwnedPendingObjectPath,
  parseOwnedCampaignObjectPath,
  uploadCampaignImageObject,
  validateCampaignImageBuffer,
} from "@/src/lib/campaign-image-storage";

export const runtime = "nodejs";

function asFormString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function isSafeId(value: string): boolean {
  return /^[a-z0-9]{1,64}$/i.test(value);
}

async function handleCampaignImageUpload(
  userId: string,
  userRole: string,
  file: File,
  campaignIdRaw: string,
  replaceUrlRaw: string
): Promise<NextResponse> {
  // [Reason] Same gate as POST /api/campaigns: BUSINESS role plus a business profile, then owner check
  if (userRole !== "BUSINESS") {
    throw new ForbiddenError("Only businesses can upload campaign images");
  }

  const business = await businessRepository.findByUserId(userId);
  if (!business) {
    throw new NotFoundError("Business profile not found");
  }

  let campaignId: string | null = null;
  if (campaignIdRaw) {
    if (!isSafeId(campaignIdRaw)) {
      return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
    }
    const ownerBusinessId = await campaignRepository.findOwner(campaignIdRaw);
    if (!ownerBusinessId) {
      throw new NotFoundError("Campaign not found");
    }
    if (ownerBusinessId !== business.id) {
      throw new ForbiddenError("You do not own this campaign");
    }
    campaignId = campaignIdRaw;
  }

  // [Reason] Reject oversized uploads before buffering the whole file into memory
  if (typeof file.size === "number" && file.size > MAX_CAMPAIGN_IMAGE_BYTES) {
    throw new AppError("File is too large", 400, "VALIDATION_ERROR");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = validateCampaignImageBuffer(buffer);
  const objectPath = campaignId
    ? buildCampaignImageObjectPath(campaignId, mimeType)
    : buildCampaignImageObjectPath(business.id, mimeType, { pending: true });

  const url = await uploadCampaignImageObject(objectPath, buffer, mimeType);

  // [Reason] Replace only after the new object exists so a failed upload cannot delete the previous image
  if (replaceUrlRaw) {
    await maybeDeleteReplacedImage(replaceUrlRaw, business.id, campaignId);
  }

  return NextResponse.json({ url });
}

async function maybeDeleteReplacedImage(
  replaceUrl: string,
  businessId: string,
  campaignId: string | null
): Promise<void> {
  const objectPath = getCampaignImageObjectPath(replaceUrl);
  if (!objectPath) {
    return;
  }

  if (isOwnedPendingObjectPath(objectPath, businessId)) {
    await deleteCampaignImageObject(replaceUrl);
    return;
  }

  const pathCampaignId = parseOwnedCampaignObjectPath(objectPath);
  if (!pathCampaignId) {
    return;
  }

  if (campaignId && pathCampaignId === campaignId) {
    await deleteCampaignImageObject(replaceUrl);
    return;
  }

  const ownerBusinessId = await campaignRepository.findOwner(pathCampaignId);
  if (ownerBusinessId === businessId) {
    await deleteCampaignImageObject(replaceUrl);
  }
}

export async function POST(request: NextRequest) {
  try {
    // [Reason] Uploads must require the same session cookie as the rest of the API
    const user = await getCurrentUser();

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const purpose = asFormString(data.get("purpose"));
    // [Reason] Isolate campaign images on Supabase without changing avatar/portfolio filesystem uploads
    if (purpose === "campaign") {
      return await handleCampaignImageUpload(
        user.id,
        user.role,
        file,
        asFormString(data.get("campaignId")),
        asFormString(data.get("replaceUrl"))
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const url = await saveUpload(filename, buffer);

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof AppError) return handleApiError(error);
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

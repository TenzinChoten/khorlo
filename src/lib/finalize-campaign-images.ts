import { prisma } from "@/src/lib/prisma";
import {
  copyPendingCampaignImageToCampaign,
  deleteCampaignImageObject,
  getCampaignImageObjectPath,
  isOwnedPendingObjectPath,
} from "@/src/lib/campaign-image-storage";

/**
 * After a campaign is created, move pending Storage objects into campaigns/<campaignId>/
 * and point CampaignImage.imageUrl at the final public URL.
 * If copy or the DB update fails, the row keeps the pending URL so the file still exists.
 */
export async function finalizeCreatedCampaignImages(
  campaignId: string,
  businessId: string
): Promise<void> {
  const images = await prisma.campaignImage.findMany({
    where: { campaignId },
    select: { id: true, imageUrl: true },
  });

  for (const image of images) {
    const pendingPath = getCampaignImageObjectPath(image.imageUrl);
    if (!pendingPath || !isOwnedPendingObjectPath(pendingPath, businessId)) {
      continue;
    }

    const finalUrl = await copyPendingCampaignImageToCampaign(
      image.imageUrl,
      campaignId,
      businessId
    );
    if (!finalUrl) {
      continue;
    }

    try {
      await prisma.campaignImage.update({
        where: { id: image.id },
        data: { imageUrl: finalUrl },
      });
      // [Reason] Pending object is removable only after imageUrl points at the final path
      await deleteCampaignImageObject(image.imageUrl);
    } catch {
      console.error("Campaign image finalize database update failed");
      // [Reason] Roll back the copy so the still-pending imageUrl does not point at a missing object
      await deleteCampaignImageObject(finalUrl);
    }
  }
}
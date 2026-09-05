import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { campaignService } from "@/src/services/campaign.service";
import { handleApiError } from "@/src/utils/api-error-handler";
import { getCurrentUser } from "@/src/lib/auth";
import { ForbiddenError } from "@/src/types";
import { finalizeCreatedCampaignImages } from "@/src/lib/finalize-campaign-images";

export async function GET(request: NextRequest) {
  try {
    // [Reason] Reuse campaignService so discovery filters run in Prisma instead of a second listing path
    const result = await campaignService.list(request.nextUrl.searchParams);
    return NextResponse.json({ ...result, campaigns: result.items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // [Reason] Campaign creation must use the same cookie JWT path as notifications and dashboards
    const payload = await getCurrentUser();

    if (payload.role !== "BUSINESS") {
      throw new ForbiddenError("Only businesses can create campaigns");
    }

    const business = await prisma.businessProfile.findUnique({
      where: { userId: payload.id }
    });

    if (!business) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

    // [Reason] The live create path bypasses campaignService, so entitlement must run here too
    const { assertCanPostCampaign } = await import(
      "@/src/services/campaign-entitlement.service"
    );
    await assertCanPostCampaign(business.id);

    const data = await request.json();

    const campaign = await prisma.campaign.create({
      data: {
        businessId: business.id,
        title: data.title,
        description: data.description,
        productName: data.productName || null,
        status: data.status || "DRAFT",
        applicationDeadline: data.deadline ? new Date(data.deadline) : null,
        contentDeadline: data.contentDeadline ? new Date(data.contentDeadline) : null,
        locationType: data.locationType || "ONLINE",
        country: (data.locationType === 'OFFLINE' || data.locationType === 'HYBRID') ? data.country : null,
        state: (data.locationType === 'OFFLINE' || data.locationType === 'HYBRID') ? data.state : null,
        city: (data.locationType === 'OFFLINE' || data.locationType === 'HYBRID') ? data.city : null,
        address: (data.locationType === 'OFFLINE' || data.locationType === 'HYBRID') ? data.address : null,
        compensationType: data.compensationType || "PAID",
        budget: data.budget ? parseFloat(data.budget.replace(/[^0-9.]/g, "")) : null,
        currency: data.currency || "USD",
        creatorSlots: data.creatorSlots || 1,
        
        contentNiches: {
          create: (data.niches || []).map((nicheName: string) => ({
            contentNiche: {
              connectOrCreate: {
                where: { name: nicheName },
                create: { name: nicheName }
              }
            }
          }))
        },
        
        contentFormats: {
          create: (data.formats || []).map((formatName: string) => ({
            quantity: data.formatQuantities?.[formatName] ? parseInt(data.formatQuantities[formatName]) : 1,
            contentFormat: {
              connectOrCreate: {
                where: { name: formatName },
                create: { name: formatName }
              }
            }
          }))
        },

        images: {
          create: [
            ...(data.bannerUrl ? [{ imageUrl: data.bannerUrl, imageType: "OTHER" as any }] : []),
            ...(data.logoUrl ? [{ imageUrl: data.logoUrl, imageType: "BRAND_LOGO" as any }] : [])
          ]
        }
      }
    });

    // [Reason] Move pending Storage objects into campaigns/<id>/ only after the campaign row exists
    await finalizeCreatedCampaignImages(campaign.id, business.id);

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

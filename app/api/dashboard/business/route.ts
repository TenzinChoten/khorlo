import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET() {
  try {
    // [Reason] Dashboard stats must authenticate with the shared cookie JWT helper
    const authUser = await getCurrentUser();

    const business = await prisma.businessProfile.findUnique({
      where: { userId: authUser.id }
    });
    if (!business) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const [activeCampaigns, draftCampaigns, completedCampaigns, totalApplications] = await Promise.all([
      prisma.campaign.count({
        where: { businessId: business.id, status: "OPEN" }
      }),
      // [Reason] Dashboard tab counts must reflect real campaign statuses, not hardcoded zeros
      prisma.campaign.count({
        where: { businessId: business.id, status: "DRAFT" }
      }),
      prisma.campaign.count({
        where: { businessId: business.id, status: { in: ["COMPLETED", "CLOSED"] } }
      }),
      prisma.application.count({
        where: { campaign: { businessId: business.id } }
      }),
    ]);

    const recentApplications = await prisma.application.findMany({
      where: { campaign: { businessId: business.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        // [Reason] Include campaign id so Recent Applications can navigate to campaign detail
        campaign: { select: { id: true, title: true } },
        influencer: {
          include: {
            user: { select: { name: true } }
          }
        },
        conversation: { select: { id: true } },
      }
    });

    const campaigns = await prisma.campaign.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true }
        },
        contentFormats: {
          include: { contentFormat: { select: { name: true } } }
        },
        // [Reason] Dashboard campaign cards need the stored CampaignImage so they don't fall back to avatars
        images: {
          select: { id: true, imageUrl: true, imageType: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
        business: {
          select: { companyLogo: true },
        },
      }
    });

    return NextResponse.json({
      dashboard: {
        stats: {
          activeCampaigns,
          draftCampaigns,
          completedCampaigns,
          totalApplications,
        },
        recentApplications,
        recentCampaigns: campaigns.slice(0, 5),
        campaigns,
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

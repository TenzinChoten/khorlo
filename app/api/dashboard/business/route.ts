import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";



export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const business = await prisma.businessProfile.findUnique({
      where: { userId: authUser.id }
    });
    if (!business) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const [activeCampaigns, totalApplications] = await Promise.all([
      prisma.campaign.count({
        where: { businessId: business.id, status: "OPEN" }
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
        }
      }
    });

    const recentCampaigns = await prisma.campaign.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    return NextResponse.json({
      dashboard: {
        stats: {
          activeCampaigns,
          totalApplications,
        },
        recentApplications,
        recentCampaigns
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

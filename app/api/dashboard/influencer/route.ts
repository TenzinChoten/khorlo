import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";



export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const influencer = await prisma.influencerProfile.findUnique({
      where: { userId: authUser.id }
    });
    if (!influencer) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const [activePartnerships, pendingApplications, totalApplications] = await Promise.all([
      prisma.application.count({
        where: { influencerId: influencer.id, status: "ACCEPTED" }
      }),
      prisma.application.count({
        where: { influencerId: influencer.id, status: "PENDING" }
      }),
      prisma.application.count({
        // [Reason] Total Applications must count every application, not only the recent 5
        where: { influencerId: influencer.id }
      }),
    ]);

    const recentApplications = await prisma.application.findMany({
      where: { influencerId: influencer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        campaign: {
          include: {
            business: {
              select: { companyName: true, companyLogo: true }
            },
            images: {
              select: { id: true, imageUrl: true, imageType: true, sortOrder: true },
              orderBy: { sortOrder: "asc" },
            },
          }
        },
        // [Reason] Dashboard Message button needs the conversation created on acceptance
        conversation: { select: { id: true } },
      }
    });

    return NextResponse.json({
      dashboard: {
        stats: {
          activePartnerships,
          pendingApplications,
          totalApplications,
        },
        recentApplications
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

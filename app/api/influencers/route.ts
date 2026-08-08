import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const influencers = await prisma.influencerProfile.findMany({
      where: {
        applicationStatus: "APPROVED",
        ...(search && {
          OR: [
            { displayName: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } }
          ]
        })
      },
      include: {
        user: { select: { name: true } },
        contentNiches: { include: { contentNiche: { select: { name: true } } } },
      },
      take: 24,
    });

    // Attach aggregated social stats
    const withStats = await Promise.all(
      influencers.map(async (inf) => {
        const accounts = await prisma.socialAccount.findMany({ where: { userId: inf.userId } });
        const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);
        const avgEngagement = accounts.length
          ? accounts.reduce((sum, a) => sum + a.engagementRate, 0) / accounts.length
          : 0;
        return { ...inf, totalFollowers, avgEngagement };
      })
    );

    return NextResponse.json({ influencers: withStats });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

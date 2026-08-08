import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        business: {
          select: { companyName: true, companyLogo: true, companyDescription: true, website: true }
        },
        contentNiches: {
          include: { contentNiche: { select: { name: true } } }
        },
        contentFormats: {
          include: { contentFormat: { select: { name: true } } }
        },
        images: true,
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

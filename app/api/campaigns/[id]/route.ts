import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
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
        _count: {
          select: {
            applications: { where: { status: "ACCEPTED" } },
          },
        },
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // [Reason] Expose filled slots so the UI can enforce the campaign creatorSlots cap
    const { _count, ...campaignData } = campaign;
    return NextResponse.json({
      campaign: { ...campaignData, acceptedCount: _count.applications },
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

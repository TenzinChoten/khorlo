import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "OPEN",
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { business: { companyName: { contains: search, mode: "insensitive" } } }
          ]
        })
      },
      include: {
        business: { select: { companyName: true, companyLogo: true } },
        contentNiches: { include: { contentNiche: { select: { name: true } } } },
        contentFormats: { include: { contentFormat: { select: { name: true } } } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    if (payload.role !== "BUSINESS") {
      return NextResponse.json({ error: "Only businesses can create campaigns" }, { status: 403 });
    }

    const business = await prisma.businessProfile.findUnique({
      where: { userId: payload.id }
    });

    if (!business) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

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

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

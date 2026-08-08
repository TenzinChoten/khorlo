import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import bcrypt from "bcryptjs";



export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: authUser.id },
      include: {
        user: { select: { name: true, email: true } },
        campaigns: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, title: true, status: true, createdAt: true }
        }
      }
    });

    const socialAccounts = await prisma.socialAccount.findMany({
      where: { userId: authUser.id }
    });

    return NextResponse.json({ profile: { ...profile, socialAccounts } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { 
      companyName, companyDescription, website, companyLogo, country, state, city, 
      heardAboutUs, socialAccounts, email, password, oldPassword, userName 
    } = body;

    const userUpdateData: any = {};
    if (heardAboutUs) userUpdateData.heardAboutUs = heardAboutUs;
    if (email) userUpdateData.email = email;
    if (userName) userUpdateData.name = userName;
    if (password) {
      if (!oldPassword) {
        return NextResponse.json({ error: "Old password is required to change password" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: authUser.id } });
      const isValid = await bcrypt.compare(oldPassword, user?.password || "");
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect old password" }, { status: 400 });
      }
      userUpdateData.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: authUser.id },
        data: userUpdateData
      });
    }

    if (socialAccounts && Array.isArray(socialAccounts)) {
      // Clear existing and add new
      await prisma.socialAccount.deleteMany({ where: { userId: authUser.id } });
      await prisma.socialAccount.createMany({
        data: socialAccounts.map(s => ({
          userId: authUser.id,
          platform: s.platform,
          username: s.username,
          profileUrl: s.profileUrl || null,
          followers: parseInt(s.followers) || 0,
          engagementRate: parseFloat(s.engagementRate) || 0,
        }))
      });
    }

    const updated = await prisma.businessProfile.upsert({
      where: { userId: authUser.id },
      create: {
        userId: authUser.id,
        companyName: companyName || '',
        companyDescription: companyDescription || null,
        website: website || null,
        companyLogo: companyLogo || null,
        country: country || null,
        state: state || null,
        city: city || null,
      },
      update: {
        ...(companyName && { companyName }),
        ...(companyDescription !== undefined && { companyDescription }),
        ...(website !== undefined && { website }),
        ...(companyLogo !== undefined && { companyLogo }),
        ...(country !== undefined && { country }),
        ...(state !== undefined && { state }),
        ...(city !== undefined && { city }),
      },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

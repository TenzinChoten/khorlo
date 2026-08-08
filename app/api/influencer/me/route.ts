import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import bcrypt from "bcryptjs";



export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.influencerProfile.findUnique({
      where: { userId: authUser.id },
      include: {
        user: { select: { name: true, email: true } },
        contentNiches: { include: { contentNiche: true } },
        contentFormats: { include: { contentFormat: true } },
        portfolioItems: true,
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
      displayName, bio, profilePhoto, age, gender, country, state, city, 
      ethnicity, previousBrands, heardAboutUs, contentNiches, contentFormats, socialAccounts,
      email, password, oldPassword, userName
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

    const updated = await prisma.influencerProfile.upsert({
      where: { userId: authUser.id },
      create: {
        userId: authUser.id,
        displayName: displayName || '',
        bio: bio || null,
        profilePhoto: profilePhoto || null,
        age: age || null,
        gender: gender || null,
        country: country || null,
        state: state || null,
        city: city || null,
        ethnicity: ethnicity || null,
        previousBrands: previousBrands || null,
      },
      update: {
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(age !== undefined && { age }),
        ...(gender !== undefined && { gender }),
        ...(country !== undefined && { country }),
        ...(state !== undefined && { state }),
        ...(city !== undefined && { city }),
        ...(ethnicity !== undefined && { ethnicity }),
        ...(previousBrands !== undefined && { previousBrands }),
        ...(contentNiches && Array.isArray(contentNiches) && {
          contentNiches: {
            deleteMany: {},
            create: contentNiches.map(name => ({
              contentNiche: {
                connectOrCreate: {
                  where: { name },
                  create: { name }
                }
              }
            }))
          }
        }),
        ...(contentFormats && Array.isArray(contentFormats) && {
          contentFormats: {
            deleteMany: {},
            create: contentFormats.map(name => ({
              contentFormat: {
                connectOrCreate: {
                  where: { name },
                  create: { name }
                }
              }
            }))
          }
        })
      },
      include: {
        user: { select: { name: true, email: true } },
        contentNiches: { include: { contentNiche: true } },
        contentFormats: { include: { contentFormat: true } },
        portfolioItems: true,
      }
    });

    const updatedSocialAccounts = await prisma.socialAccount.findMany({
      where: { userId: authUser.id }
    });

    return NextResponse.json({ profile: { ...updated, socialAccounts: updatedSocialAccounts } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

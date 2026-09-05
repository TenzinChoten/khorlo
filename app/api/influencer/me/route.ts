import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import bcrypt from "bcryptjs";
import { handleApiError } from "@/src/utils/api-error-handler";
import { sanitizePublicText, sanitizePublicUrl } from "@/src/lib/public-url";

export async function GET() {
  try {
    // [Reason] Profile reads must use the shared cookie JWT helper
    const authUser = await getCurrentUser();

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

    if (!profile) {
      return NextResponse.json({ profile: { socialAccounts } });
    }

    const bio = sanitizePublicText(profile.bio);
    // [Reason] Strip infra/dashboard text if it was saved into a creator bio
    if (bio !== profile.bio) {
      await prisma.influencerProfile.update({
        where: { id: profile.id },
        data: { bio },
      });
    }

    const safeSocials = socialAccounts.map((account) => ({
      ...account,
      profileUrl: sanitizePublicUrl(account.profileUrl),
    }));

    return NextResponse.json({ profile: { ...profile, bio, socialAccounts: safeSocials } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    const body = await request.json();
    const { 
      displayName, bio, profilePhoto, age, gender, country, state, city, 
      ethnicity, previousBrands, heardAboutUs, contentNiches, contentFormats, socialAccounts,
      email, password, oldPassword, userName, portfolioItem
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
          profileUrl: sanitizePublicUrl(s.profileUrl),
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
        bio: sanitizePublicText(bio),
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
        ...(bio !== undefined && { bio: sanitizePublicText(bio) }),
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

    // [Reason] Create or update a single portfolio piece without wiping the rest
    if (portfolioItem) {
      if (portfolioItem.id && portfolioItem._delete) {
        const ownedItem = await prisma.portfolio.findFirst({
          where: { id: portfolioItem.id, influencerId: updated.id },
        });
        if (ownedItem) {
          await prisma.portfolio.delete({ where: { id: ownedItem.id } });
        }
      } else {
        const title = typeof portfolioItem.title === "string" ? portfolioItem.title.trim() : "";
        if (!title) {
          return NextResponse.json({ error: "Portfolio title is required" }, { status: 400 });
        }

        const portfolioData = {
          title,
          description: portfolioItem.description?.trim() || null,
          thumbnail: portfolioItem.thumbnail || null,
          url: portfolioItem.url?.trim() || null,
        };

        if (portfolioItem.id) {
          const ownedItem = await prisma.portfolio.findFirst({
            where: { id: portfolioItem.id, influencerId: updated.id },
          });
          if (!ownedItem) {
            return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
          }
          await prisma.portfolio.update({
            where: { id: ownedItem.id },
            data: portfolioData,
          });
        } else {
          await prisma.portfolio.create({
            data: {
              influencerId: updated.id,
              ...portfolioData,
            },
          });
        }
      }
    }

    const updatedSocialAccounts = await prisma.socialAccount.findMany({
      where: { userId: authUser.id }
    });

    const profileWithPortfolio = portfolioItem
      ? await prisma.influencerProfile.findUnique({
          where: { id: updated.id },
          include: {
            user: { select: { name: true, email: true } },
            contentNiches: { include: { contentNiche: true } },
            contentFormats: { include: { contentFormat: true } },
            portfolioItems: true,
          },
        })
      : updated;

    return NextResponse.json({ profile: { ...profileWithPortfolio, socialAccounts: updatedSocialAccounts } });
  } catch (error) {
    return handleApiError(error);
  }
}

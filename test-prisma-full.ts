import { prisma } from "./src/lib/prisma";
import { ensureDefaultFreeSubscription } from "./src/services/subscription.service";
import { sanitizePublicText, sanitizePublicUrl } from "./src/lib/public-url";

async function run() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'BUSINESS' } });
    if (!user) return;
    
    console.log("Upserting profile for user:", user.id);
    
    const companyName = "Test Company";
    const companyDescription = "Test Description";
    const website = "https://example.com";
    const companyLogo = null;
    const country = "US";
    const state = "CA";
    const city = "LA";
    
    const updated = await prisma.businessProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        companyName: companyName || '',
        companyDescription: sanitizePublicText(companyDescription),
        website: sanitizePublicUrl(website),
        companyLogo: companyLogo || null,
        country: country || null,
        state: state || null,
        city: city || null,
      },
      update: {
        ...(companyName && { companyName }),
        ...(companyDescription !== undefined && { companyDescription: sanitizePublicText(companyDescription) }),
        ...(website !== undefined && { website: sanitizePublicUrl(website) }),
        ...(companyLogo !== undefined && { companyLogo }),
        ...(country !== undefined && { country }),
        ...(state !== undefined && { state }),
        ...(city !== undefined && { city }),
      },
    });
    
    console.log("Profile upserted:", updated.id);
    
    console.log("Ensuring free sub...");
    await ensureDefaultFreeSubscription(updated.id);
    console.log("Free sub ensured");
    
    const heardAboutUs = "TikTok";
    const userUpdateData: any = {};
    if (heardAboutUs) userUpdateData.heardAboutUs = heardAboutUs;
    
    console.log("Updating user...");
    await prisma.user.update({
      where: { id: user.id },
      data: userUpdateData
    });
    console.log("User updated");
    
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import catalog from "../frontend/src/data/khorlo-plans.json";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to seed plans");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const catalogNames = new Set<string>();

  for (const family of catalog.families) {
    for (const variant of family.variants) {
      catalogNames.add(variant.name);
      // [Reason] Upsert by unique name so we refresh prices/limits without a schema change
      await prisma.plan.upsert({
        where: { name: variant.name },
        create: {
          name: variant.name,
          price: variant.price,
          billingCycle: variant.billingCycle as "MONTHLY" | "YEARLY",
          campaignLimit: variant.campaignLimit,
          messageLimit: variant.messageLimit,
          advancedSearch: variant.advancedSearch,
          featuredCampaigns: variant.featuredCampaigns,
          isActive: true,
        },
        update: {
          price: variant.price,
          billingCycle: variant.billingCycle as "MONTHLY" | "YEARLY",
          campaignLimit: variant.campaignLimit,
          messageLimit: variant.messageLimit,
          advancedSearch: variant.advancedSearch,
          featuredCampaigns: variant.featuredCampaigns,
          isActive: true,
        },
      });
    }
  }

  // [Reason] Hide leftover demo plans so checkout only offers the conversion catalog
  await prisma.plan.updateMany({
    where: { name: { notIn: [...catalogNames] } },
    data: { isActive: false },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

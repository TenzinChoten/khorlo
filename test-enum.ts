import { prisma } from "./src/lib/prisma";

async function run() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'BUSINESS' } });
    if (!user) return;
    
    console.log("Checking findFirst...");
    const sub = await prisma.subscription.findFirst({
      where: {
        businessId: "test",
        OR: [
          { status: "PENDING" },
        ]
      }
    });
    console.log("Found:", sub?.id);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();

const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'BUSINESS' } });
    console.log("User:", user.id);
    
    await prisma.socialAccount.createMany({
      data: [{
        userId: user.id,
        platform: 'INSTAGRAM',
        username: 'sdsdf',
        profileUrl: null,
        followers: parseInt('105') || 0,
        engagementRate: parseFloat('4.4') || 0,
      }]
    });
    console.log("Success");
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();

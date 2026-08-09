import prisma from "./lib/prisma";
async function run() {
  const users = await prisma.user.findMany({ select: { email: true }});
  console.log(users);
}
run();

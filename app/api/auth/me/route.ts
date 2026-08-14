import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET() {
  try {
    // [Reason] Use the shared cookie+jose helper so /me matches every other protected route
    const currentUser = await getCurrentUser();

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true, name: true, email: true, role: true,
        businessProfile: { select: { country: true } },
        influencerProfile: { select: { country: true } }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const onboardingComplete = !!(user.businessProfile?.country || user.influencerProfile?.country);
    const userToReturn = {
      id: user.id, name: user.name, email: user.email, role: user.role, onboardingComplete
    };

    return NextResponse.json({ user: userToReturn });
  } catch (error) {
    return handleApiError(error);
  }
}

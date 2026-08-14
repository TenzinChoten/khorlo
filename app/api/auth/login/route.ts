import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/src/lib/cookies";


const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        businessProfile: { select: { country: true } },
        influencerProfile: { select: { country: true } }
      }
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const onboardingComplete = !!(user.businessProfile?.country || user.influencerProfile?.country);
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, onboardingComplete }
    });

    // [Reason] Reuse shared flags so production can persist the session across Vercel → Render
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";
import { generateAccessToken } from "@/src/lib/jwt";
import { applyAuthCookie } from "@/src/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Name, email, password and role are required" }, { status: 400 });
    }

    const validRoles: Role[] = ["BUSINESS", "INFLUENCER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Role must be BUSINESS or INFLUENCER" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        ...(role === "BUSINESS"
          ? { businessProfile: { create: { companyName: name } } }
          : { influencerProfile: { create: { displayName: name } } })
      }
    });

    // [Reason] Sign with jose so registration sessions work on every protected API
    const token = await generateAccessToken({ id: user.id, role: user.role });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }, { status: 201 });

    applyAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

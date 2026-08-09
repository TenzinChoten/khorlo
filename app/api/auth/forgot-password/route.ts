import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { emailService } from "@/lib/services/email.service";
import { getPasswordResetEmail } from "@/lib/email/templates/password-reset";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return a success message even if the user doesn't exist to prevent email enumeration
      return NextResponse.json({ success: true, message: "If your email is registered, you will receive a reset link. Please check your spam folder." });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save the token in the database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Create the reset URL pointing to the frontend
    // We use the NEXT_PUBLIC_FRONTEND_URL env var if available, or default to the Vite dev server port (5173)
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    // Generate the email content
    const emailData = getPasswordResetEmail({
      name: user.name,
      resetUrl,
      expiration: "1 hour",
    });

    // Send the email asynchronously so the user doesn't have to wait for SMTP to finish
    emailService.sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    }).catch(console.error);

    return NextResponse.json({ success: true, message: "If your email is registered, you will receive a reset link. Please check your spam folder." });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

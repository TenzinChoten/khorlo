import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/services/email.service";
import { getPasswordResetEmail } from "@/lib/email/templates/password-reset";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { to } = data;

    if (!to) {
      return NextResponse.json({ error: "Missing 'to' email address in request body" }, { status: 400 });
    }

    // Generate dummy template data
    const emailData = getPasswordResetEmail({
      name: "Test User",
      resetUrl: "https://khorlo.example.com/reset-password?token=dummy-token-123",
      expiration: "1 hour",
    });

    const result = await emailService.sendEmail({
      to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      result,
    });
  } catch (error: any) {
    console.error("Test email failed:", error);
    return NextResponse.json({ error: error.message || "Failed to send test email" }, { status: 500 });
  }
}

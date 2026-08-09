import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  /**
   * Get the initialized Nodemailer transporter
   */
  getTransporter() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!user || !pass) {
      console.warn("Email service is not fully configured: missing SMTP_USER or SMTP_PASSWORD");
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  },

  /**
   * Send an email using the configured SMTP server
   */
  async sendEmail({ to, subject, html, text }: SendEmailOptions) {
    const transporter = this.getTransporter();
    const from = process.env.EMAIL_FROM || "Khorlo <no-reply@khorlo.com>";

    try {
      const info = await transporter.sendMail({
        from,
        to,
        replyTo: process.env.SMTP_USER,
        subject,
        html,
        text,
        headers: {
          'X-Priority': '1 (Highest)',
          'X-Mailer': 'Nodemailer',
        },
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  },
};

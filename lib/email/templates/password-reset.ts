import { baseEmailLayout } from "../layout";

export interface PasswordResetData {
  name: string;
  resetUrl: string;
  expiration: string;
}

export const getPasswordResetEmail = (data: PasswordResetData) => {
  const content = `
    <p>Hi ${data.name},</p>
    
    <p>We received a request to reset the password for your Khorlo account.</p>
    
    <div style="text-align: left; margin: 24px 0;">
      <a href="${data.resetUrl}" class="btn">Reset Password</a>
      
      <div class="fallback-link">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${data.resetUrl}">${data.resetUrl}</a>
      </div>
    </div>
    
    <p>For security, this request will expire in ${data.expiration}.</p>
    
    <div class="security-notice">
      If you didn't request a password reset, you can safely ignore this email. Your password won't change until you create a new one.
    </div>
  `;

  return {
    subject: "Reset your Khorlo password",
    html: baseEmailLayout(content, "Reset your Khorlo password"),
    text: `
Hi ${data.name},

We received a request to reset the password for your Khorlo account.

Please copy and paste the following link into your browser to choose a new password:
${data.resetUrl}

For security, this request will expire in ${data.expiration}.

If you didn't request a password reset, you can safely ignore this email. Your password won't change until you create a new one.

© ${new Date().getFullYear()} Khorlo. All rights reserved.
    `.trim(),
  };
};

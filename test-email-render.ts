import { getPasswordResetEmail } from "./lib/email/templates/password-reset";

const emailData = getPasswordResetEmail({
  name: "Test User",
  resetUrl: "http://localhost:5173/reset-password?token=test-token-123",
  expiration: "1 hour"
});

console.log("=== HTML ===");
console.log(emailData.html);
console.log("\n=== TEXT ===");
console.log(emailData.text);

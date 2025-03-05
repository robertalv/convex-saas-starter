import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";

// Basic email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateEmailHtml = (code: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Your verification code</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="padding: 40px 0; max-width: 560px; margin: 0 auto; text-align: center;">
      <h1 style="color: #333; font-size: 24px; font-weight: normal; margin-bottom: 20px;">
        Your verification code
      </h1>
      <div style="background-color: #fff; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #333;">
          ${code}
        </div>
      </div>
      <p style="color: #666; font-size: 14px;">
        This code will expire in 15 minutes
      </p>
    </div>
  </body>
</html>
`;

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    expires,
  }) {
    // Validate email format
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}. Please enter a valid email address.`);
    }

    const resend = new ResendAPI(provider.apiKey);
    const html = generateEmailHtml(token);

    const { error } = await resend.emails.send({
      from: process.env.AUTH_EMAIL ?? "Convex Starter <onboarding@devwithbobby.com>",
      to: [email],
      subject: `Sign in to Convex Starter`,
      html,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
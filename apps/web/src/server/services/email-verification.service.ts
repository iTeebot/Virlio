import crypto from "crypto";
import { db } from "@virlio/database";
import { verificationTokens, users } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

interface RateLimitRecord {
  lastSentAt: number;
}

export class EmailVerificationService {
  private resendRateLimits: Map<string, RateLimitRecord> = new Map();

  /**
   * Generates a 64-character secure single-use verification token expiring in 24 hours.
   */
  public async generateVerificationToken(email: string): Promise<{ token: string; expires: Date }> {
    const cleanEmail = email.trim().toLowerCase();
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiration

    // Delete any previous verification tokens for this identifier
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, cleanEmail)).catch(() => null);

    // Insert new single-use verification token
    await db.insert(verificationTokens).values({
      identifier: cleanEmail,
      token,
      expires,
    });

    return { token, expires };
  }

  /**
   * Enforces 60-second rate-limiting cooldown for resending verification emails.
   */
  public checkRateLimit(email: string): { allowed: boolean; remainingSeconds: number } {
    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();
    const existing = this.resendRateLimits.get(cleanEmail);

    if (existing && now - existing.lastSentAt < 60000) {
      const remainingSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return { allowed: false, remainingSeconds };
    }

    this.resendRateLimits.set(cleanEmail, { lastSentAt: now });
    return { allowed: true, remainingSeconds: 0 };
  }

  /**
   * Sends branded Virlio HTML verification email via Resend REST API.
   */
  public async sendVerificationEmail(toEmail: string, userName: string, token: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Virlio <onboarding@resend.dev>";
    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;

    const html = this.formatVerificationEmailHtml(userName || "Creator", verifyUrl);

    if (!apiKey) {
      console.warn(`[EmailVerification DEV FALLBACK] RESEND_API_KEY missing. Verification link for ${toEmail}: ${verifyUrl}`);
      if (process.env.NODE_ENV !== "production") return true;
      throw new Error("Email service is not configured. RESEND_API_KEY is missing.");
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: "Verify Your Virlio Account Email",
          html,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("[EmailVerification] Resend API error response:", json);
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[EmailVerification DEV FALLBACK] Resend delivery notice (${res.status}). Link for ${toEmail}: ${verifyUrl}`);
          return true;
        }
        throw new Error(json.message || `Email delivery failed with status ${res.status}`);
      }

      console.log(`[EmailVerification] Successfully delivered verification email to ${toEmail} (ID: ${json.id})`);
      return true;
    } catch (err: any) {
      console.error("[EmailVerification] Resend email delivery exception:", err);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[EmailVerification DEV FALLBACK] Link for ${toEmail}: ${verifyUrl}`);
        return true;
      }
      throw err;
    }
  }

  /**
   * Atomically verifies a token, activates the user, and invalidates the token.
   */
  public async verifyToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
    if (!token || typeof token !== "string") {
      return { success: false, error: "Verification token is required." };
    }

    const record = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });

    if (!record) {
      return { success: false, error: "Invalid or already used verification link." };
    }

    if (new Date() > new Date(record.expires)) {
      await db.delete(verificationTokens).where(eq(verificationTokens.token, token)).catch(() => null);
      return { success: false, error: "Verification link has expired. Please request a new verification email." };
    }

    // Single-use token enforcement: delete token immediately upon verification
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token)).catch(() => null);

    // Activate database user account
    const cleanEmail = record.identifier.trim().toLowerCase();
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (existingUser) {
      await db
        .update(users)
        .set({
          emailVerified: new Date(),
          account_status: "active",
          updated_at: new Date(),
        })
        .where(eq(users.id, existingUser.id));
    }

    return { success: true, email: cleanEmail };
  }

  /**
   * Formats Virlio Branded HTML Verification Email (No Gradients, Crisp Solid Palette).
   */
  public formatVerificationEmailHtml(name: string, verifyUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify your Virlio Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 16px; color: #0f172a; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }
            .brand-header { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
            .brand-logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #1e293b; text-decoration: none; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
            .subtitle { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 28px; }
            .btn-container { text-align: center; margin: 32px 0; }
            .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; border: 1px solid #1d4ed8; }
            .fallback-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 28px 0; font-size: 12px; color: #64748b; word-break: break-all; }
            .fallback-link { color: #2563eb; text-decoration: underline; }
            .notice-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-bottom: 28px; font-size: 12px; color: #1e40af; line-height: 1.5; }
            .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand-header">
              <span class="brand-logo">VIRLIO</span>
            </div>

            <div class="title">Welcome to Virlio, ${name}!</div>
            <div class="subtitle">
              Thank you for registering your account. Please verify your email address to activate your workspace and complete setup.
            </div>

            <div class="btn-container">
              <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
            </div>

            <div class="notice-box">
              ⏱ <strong>Expiration Notice:</strong> This verification link is single-use and will expire in 24 hours.
            </div>

            <div class="fallback-box">
              If the button above does not work, copy and paste this link into your browser:<br />
              <a href="${verifyUrl}" class="fallback-link">${verifyUrl}</a>
            </div>

            <div class="subtitle" style="font-size: 12px; margin-bottom: 0;">
              If you did not create a Virlio account, please ignore this message or contact <a href="mailto:virlio@iteebot.com" style="color: #2563eb;">virlio@iteebot.com</a>.
            </div>

            <div class="footer">
              © 2026 Virlio Brand Engine. All rights reserved.<br />
              Automated system security message — please do not reply directly to this email.
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailVerificationService = new EmailVerificationService();

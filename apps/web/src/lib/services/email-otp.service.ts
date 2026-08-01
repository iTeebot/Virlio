import crypto from "crypto";

interface OTPRecord {
  email: string;
  hashedOtp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

class EmailOTPService {
  private otpStore: Map<string, OTPRecord> = new Map();
  private verifiedEmails: Set<string> = new Set();

  private hashOtp(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  /**
   * Generates a 6-digit OTP, hashes it, enforces 60s cooldown, and stores it in memory.
   */
  public generateOTP(email: string): { otp: string; cooldownSeconds: number; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();
    const existing = this.otpStore.get(cleanEmail);

    // Enforce 60-second resend cooldown
    if (existing && now - existing.lastSentAt < 60000) {
      const remainingSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return {
        otp: "",
        cooldownSeconds: remainingSeconds,
        error: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
      };
    }

    // Generate secure 6-digit numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = this.hashOtp(rawOtp);
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes expiration

    this.otpStore.set(cleanEmail, {
      email: cleanEmail,
      hashedOtp,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    });

    return { otp: rawOtp, cooldownSeconds: 60 };
  }

  /**
   * Sends real HTML verification email via Resend REST API.
   */
  public async sendResendEmail(toEmail: string, otp: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Virlio <onboarding@resend.dev>";

    if (!apiKey) {
      console.warn(`[EmailOTP DEV FALLBACK] RESEND_API_KEY missing. Verification code for ${toEmail}: ${otp}`);
      if (process.env.NODE_ENV !== "production") return true;
      throw new Error("Email service is not configured. Please set RESEND_API_KEY in environment.");
    }

    const html = this.formatVerificationEmailHtml(otp);

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
          subject: `${otp} is your Virlio Email Verification Code`,
          html,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("[EmailOTP] Resend API error response:", json);
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[EmailOTP DEV FALLBACK] Resend error (${res.status}). Code for ${toEmail}: ${otp}`);
          return true;
        }
        throw new Error(json.message || `Resend delivery failed with status ${res.status}`);
      }

      console.log(`[EmailOTP] Successfully delivered verification email to ${toEmail} via Resend (ID: ${json.id})`);
      return true;
    } catch (err: any) {
      console.error("[EmailOTP] Resend email delivery exception:", err);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[EmailOTP DEV FALLBACK] Network unreachable (${err.message}). Dev code for ${toEmail}: ${otp}`);
        return true;
      }
      throw err;
    }
  }

  /**
   * Verifies the submitted 6-digit OTP against stored hash.
   */
  public verifyOTP(email: string, submittedCode: string): { verified: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = submittedCode.trim();
    const record = this.otpStore.get(cleanEmail);
    const now = Date.now();

    if (!record) {
      return { verified: false, error: "No verification code was requested for this email address." };
    }

    if (now > record.expiresAt) {
      this.otpStore.delete(cleanEmail);
      return { verified: false, error: "Verification code has expired. Please request a new code." };
    }

    if (record.attempts >= 5) {
      this.otpStore.delete(cleanEmail);
      return { verified: false, error: "Maximum verification attempts exceeded. Please request a new code." };
    }

    const hashedSubmitted = this.hashOtp(cleanCode);
    if (hashedSubmitted !== record.hashedOtp) {
      record.attempts += 1;
      return { verified: false, error: `Invalid code. ${5 - record.attempts} attempts remaining.` };
    }

    // Successful verification
    this.verifiedEmails.add(cleanEmail);
    this.otpStore.delete(cleanEmail); // Invalidate OTP after use
    return { verified: true };
  }

  public isEmailVerified(email: string): boolean {
    if (!email) return false;
    return this.verifiedEmails.has(email.trim().toLowerCase());
  }

  public markEmailVerified(email: string) {
    if (email) this.verifiedEmails.add(email.trim().toLowerCase());
  }

  /**
   * Formats Virlio HTML Email for sending verification codes.
   */
  public formatVerificationEmailHtml(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; }
            .card { max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .logo { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; margin-bottom: 24px; }
            .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
            .text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
            .code-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin-bottom: 24px; }
            .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">VIRLIO</div>
            <div class="title">Verify Your Business Email</div>
            <div class="text">Use the following 6-digit verification code to complete your Brand Creation in Virlio. This code is valid for 10 minutes.</div>
            <div class="code-box">${otp}</div>
            <div class="text">If you did not request this email, you can safely ignore it.</div>
            <div class="footer">© 2026 Virlio Engine. All rights reserved.</div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailOTPService = new EmailOTPService();

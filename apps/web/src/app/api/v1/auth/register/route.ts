import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@virlio/database";
import { users } from "@virlio/database/schema";
import { eq } from "drizzle-orm";
import { userRepository } from "@/server/repositories";
import { emailVerificationService } from "@/server/services/email-verification.service";
import { earlyAccessBadgeService } from "@/server/services/early-access-badge.service";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "root",
  "support",
  "virlio",
  "api",
  "mod",
  "moderator",
  "system",
  "help",
  "billing",
  "auth",
  "login",
  "register",
  "dashboard",
  "official",
  "terms",
  "privacy",
  "explore",
  "leaderboard",
]);

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);

  if (!body) {
    return apiError("Invalid or missing request body.", 400);
  }

  let { fullName, username, email, password } = body;

  // 1. Sanitization & Normalization
  fullName = (fullName || "").trim().normalize("NFC");
  username = (username || "").trim().toLowerCase().normalize("NFC");
  email = (email || "").trim().toLowerCase().normalize("NFC");
  password = typeof password === "string" ? password : "";

  // 2. Server-side Input Validation
  if (!fullName || fullName.length < 2 || fullName.length > 100) {
    return apiError("Full Name must be between 2 and 100 characters.", 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return apiError("Please provide a valid email address.", 400);
  }

  if (!username || username.length < 3 || username.length > 30) {
    return apiError("Username must be between 3 and 30 characters.", 400);
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return apiError("Username can only contain letters, numbers, underscores, and hyphens.", 400);
  }

  if (RESERVED_USERNAMES.has(username)) {
    return apiError(`Username '@${username}' is reserved and unavailable. Please choose another username.`, 400);
  }

  const termsAccepted = body.termsAccepted === true || body.agreedTerms === true;
  if (!termsAccepted) {
    return apiError("You must accept the Terms and Conditions to create an account.", 400);
  }

  if (!password || password.length < 8 || password.length > 100) {
    return apiError("Password must be at least 8 characters long.", 400);
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return apiError("Password must contain both letters and numbers.", 400);
  }

  // 3. Uniqueness Checks against Database
  const existingEmailUser = await userRepository.findByEmail(email);
  if (existingEmailUser) {
    return apiError("An account with this email address already exists. Please sign in instead.", 400);
  }

  const existingUsernameUser = await userRepository.findByUsername(username);
  if (existingUsernameUser) {
    return apiError(`Username '@${username}' is already taken. Please choose a different username.`, 400);
  }

  // 4. Hash Password
  const passwordHash = await bcrypt.hash(password, 10);

  // 5. Create Database User (Pending State)
  let createdUser: any = null;
  try {
    const isMarketingOptIn = Boolean(body.marketingOptIn);
    const [inserted] = await db
      .insert(users)
      .values({
        name: fullName,
        display_name: fullName,
        username,
        email,
        password_hash: passwordHash,
        account_status: "pending",
        role: "user",
        emailVerified: null,
        marketing_opt_in: isMarketingOptIn,
        marketing_opt_in_at: isMarketingOptIn ? new Date() : null,
      })
      .returning();

    createdUser = inserted;
  } catch (err: any) {
    console.error("[Register] Error creating user record in database:", err);
    return apiError("Database error creating user account. Please try again.", 500);
  }

  // 6. Server-Side Early Access Badge Awarding
  // Evaluates trusted server creation timestamp against Sept 30, 2026 cutoff
  await earlyAccessBadgeService.evaluateAndAward(createdUser.id, createdUser.created_at).catch((err) => {
    console.error("[Register] Error evaluating Early Access badge:", err);
  });

  // 7. Generate Verification Token & Send Verification Email
  try {
    const { token } = await emailVerificationService.generateVerificationToken(email);
    await emailVerificationService.sendVerificationEmail(email, fullName, token);
  } catch (emailErr: any) {
    console.error("[Register] Failed to deliver verification email. Triggering atomic rollback...", emailErr);

    // ATOMIC ROLLBACK: Remove the created user record if verification email delivery fails
    if (createdUser?.id) {
      await db.delete(users).where(eq(users.id, createdUser.id)).catch(() => null);
    }

    return apiError("We couldn't send your verification email. Please try again.", 400);
  }

  return apiSuccess(
    {
      registered: true,
      email: createdUser.email,
      username: createdUser.username,
    },
    201
  );
});

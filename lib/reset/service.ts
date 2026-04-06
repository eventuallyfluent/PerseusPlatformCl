/**
 * Password reset service.
 * Generates single-use, 1-hour tokens stored in PasswordResetToken.
 */
import crypto from "crypto";
import { db } from "@/lib/db";

const TOKEN_TTL_HOURS = 1;

/** Create a fresh reset token for an email address. Returns null if user not found. */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return null; // Don't reveal whether email exists — caller returns 200 regardless

  // Invalidate any previous unused tokens for this user
  await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await db.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

  return token;
}

export type ResetTokenValidation =
  | { valid: true; userId: string }
  | { valid: false; error: string };

/** Validate a reset token without consuming it. */
export async function validateResetToken(token: string): Promise<ResetTokenValidation> {
  const record = await db.passwordResetToken.findUnique({ where: { token } });

  if (!record) return { valid: false, error: "Invalid or expired reset link." };
  if (record.usedAt) return { valid: false, error: "This reset link has already been used." };
  if (record.expiresAt < new Date()) return { valid: false, error: "This reset link has expired. Please request a new one." };

  return { valid: true, userId: record.userId };
}

/** Consume a reset token and update the user's password. */
export async function consumeResetToken(token: string, newPasswordHash: string): Promise<boolean> {
  const validation = await validateResetToken(token);
  if (!validation.valid) return false;

  await db.$transaction([
    db.user.update({ where: { id: validation.userId }, data: { passwordHash: newPasswordHash } }),
    db.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  return true;
}

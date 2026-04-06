import type { EnrollmentConfirmationParams, PurchaseReceiptParams, PasswordResetParams } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f9fafb; font-family: system-ui, -apple-system, sans-serif; color: #111827; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: #4f46e5; padding: 28px 32px; }
    .header a { color: #fff; font-size: 20px; font-weight: 700; text-decoration: none; letter-spacing: -0.5px; }
    .body { padding: 32px; }
    h1 { font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #111827; }
    p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #374151; }
    .btn { display: inline-block; background: #4f46e5; color: #fff !important; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .meta { font-size: 12px; color: #9ca3af; }
    .footer { background: #f3f4f6; padding: 20px 32px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${BASE_URL}">Perseus</a>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Perseus Platform · You're receiving this because you enrolled in a course.
    </div>
  </div>
</body>
</html>`;
}

// ─── Enrollment Confirmation ──────────────────────────────────────────────────

export function enrollmentConfirmationHtml(p: EnrollmentConfirmationParams): string {
  const greeting = p.studentName ? `Hi ${p.studentName},` : "Hi there,";
  const learnUrl = `${BASE_URL}/learn/${p.courseSlug}`;

  return layout(
    `You're enrolled in ${p.courseTitle}`,
    `
    <h1>You're in! 🎉</h1>
    <p>${greeting}</p>
    <p>
      You now have full access to <strong>${p.courseTitle}</strong> by ${p.instructorName}.
      Click below to start learning immediately.
    </p>
    <p style="margin: 24px 0;">
      <a href="${learnUrl}" class="btn">Start learning →</a>
    </p>
    <hr class="divider" />
    <p class="meta">
      If the button doesn't work, copy this URL into your browser:<br />
      <a href="${learnUrl}" style="color: #4f46e5;">${learnUrl}</a>
    </p>
    `
  );
}

export function enrollmentConfirmationText(p: EnrollmentConfirmationParams): string {
  const greeting = p.studentName ? `Hi ${p.studentName},` : "Hi there,";
  return [
    `You're enrolled in ${p.courseTitle}!`,
    "",
    greeting,
    "",
    `You now have full access to "${p.courseTitle}" by ${p.instructorName}.`,
    "",
    `Start learning: ${BASE_URL}/learn/${p.courseSlug}`,
    "",
    `— The Perseus Team`,
  ].join("\n");
}

// ─── Purchase Receipt ─────────────────────────────────────────────────────────

export function purchaseReceiptHtml(p: PurchaseReceiptParams): string {
  const greeting = p.studentName ? `Hi ${p.studentName},` : "Hi there,";

  return layout(
    `Receipt for ${p.courseTitle}`,
    `
    <h1>Payment confirmed ✓</h1>
    <p>${greeting}</p>
    <p>Thanks for your purchase. Here's your receipt:</p>

    <table style="width:100%; border-collapse:collapse; margin: 20px 0; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Course</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; text-align: right;">${p.courseTitle}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Amount paid</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; text-align: right;">${p.amountPaid}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b7280;">Order ID</td>
        <td style="padding: 10px 0; font-family: monospace; font-size: 12px; text-align: right; color: #9ca3af;">${p.orderId}</td>
      </tr>
    </table>

    <p>Your access has been activated. Happy learning!</p>
    <hr class="divider" />
    <p class="meta">Keep this email as your purchase record. If you have questions, reply to this email.</p>
    `
  );
}

export function purchaseReceiptText(p: PurchaseReceiptParams): string {
  const greeting = p.studentName ? `Hi ${p.studentName},` : "Hi there,";
  return [
    `Receipt for ${p.courseTitle}`,
    "",
    greeting,
    "",
    `Thanks for your purchase.`,
    "",
    `Course: ${p.courseTitle}`,
    `Amount: ${p.amountPaid}`,
    `Order ID: ${p.orderId}`,
    "",
    `Your access has been activated. Happy learning!`,
    "",
    `— The Perseus Team`,
  ].join("\n");
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export function passwordResetHtml(p: PasswordResetParams): string {
  return layout(
    "Reset your Perseus password",
    `
    <h1>Reset your password</h1>
    <p>Hi there,</p>
    <p>
      We received a request to reset the password for your Perseus account.
      Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
    </p>
    <p style="margin: 24px 0;">
      <a href="${p.resetUrl}" class="btn">Reset password →</a>
    </p>
    <hr class="divider" />
    <p class="meta">
      If you didn't request a password reset, you can safely ignore this email — your password won't change.<br /><br />
      If the button doesn't work, copy this URL into your browser:<br />
      <a href="${p.resetUrl}" style="color: #4f46e5;">${p.resetUrl}</a>
    </p>
    `
  );
}

export function passwordResetText(p: PasswordResetParams): string {
  return [
    "Reset your Perseus password",
    "",
    "Hi there,",
    "",
    "We received a request to reset your Perseus account password.",
    "Click the link below to choose a new password (expires in 1 hour):",
    "",
    p.resetUrl,
    "",
    "If you didn't request this, you can ignore this email.",
    "",
    "— The Perseus Team",
  ].join("\n");
}

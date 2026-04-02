import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { EmailAdapter, EnrollmentConfirmationParams, PurchaseReceiptParams } from "./types";
import {
  enrollmentConfirmationHtml,
  enrollmentConfirmationText,
  purchaseReceiptHtml,
  purchaseReceiptText,
} from "./templates";

// ─── Transporter singleton ────────────────────────────────────────────────────

let _transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Production SMTP — use env-configured credentials
    _transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Development fallback — auto-create Ethereal test account
    // Emails are not delivered; preview them at https://ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(
      `[email] Using Ethereal test account: ${testAccount.user}. ` +
        `Preview emails at https://ethereal.email`
    );
  }

  return _transporter;
}

const FROM =
  process.env.SMTP_FROM ?? '"Perseus Platform" <noreply@perseus.local>';

// ─── NodemailerAdapter ────────────────────────────────────────────────────────

export class NodemailerAdapter implements EmailAdapter {
  async sendEnrollmentConfirmation(p: EnrollmentConfirmationParams): Promise<void> {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: FROM,
      to: p.to,
      subject: `You're enrolled in ${p.courseTitle} 🎉`,
      text: enrollmentConfirmationText(p),
      html: enrollmentConfirmationHtml(p),
    });

    // Log preview URL in dev (Ethereal only)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[email] Enrollment confirmation preview: ${previewUrl}`);
    }
  }

  async sendPurchaseReceipt(p: PurchaseReceiptParams): Promise<void> {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: FROM,
      to: p.to,
      subject: `Your receipt for ${p.courseTitle}`,
      text: purchaseReceiptText(p),
      html: purchaseReceiptHtml(p),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[email] Purchase receipt preview: ${previewUrl}`);
    }
  }
}

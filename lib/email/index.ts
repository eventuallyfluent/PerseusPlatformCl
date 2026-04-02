/**
 * Email service entry point.
 * Returns the configured email adapter. Currently always NodemailerAdapter.
 * Swap this function to switch providers without touching call sites.
 */
import { NodemailerAdapter } from "./nodemailer";
import type { EmailAdapter } from "./types";

let _adapter: EmailAdapter | null = null;

export function getEmailAdapter(): EmailAdapter {
  if (!_adapter) {
    _adapter = new NodemailerAdapter();
  }
  return _adapter;
}

export type { EmailAdapter, EnrollmentConfirmationParams, PurchaseReceiptParams } from "./types";

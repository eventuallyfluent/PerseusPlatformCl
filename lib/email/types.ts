// ─── Email Adapter Interface ──────────────────────────────────────────────────
// All email providers must implement this interface.
// No provider-specific code ever leaks outside the adapter file.

export type EnrollmentConfirmationParams = {
  to: string;
  studentName: string | null;
  courseTitle: string;
  courseSlug: string;
  instructorName: string;
};

export type PurchaseReceiptParams = {
  to: string;
  studentName: string | null;
  courseTitle: string;
  amountPaid: string; // formatted e.g. "$99.00"
  currency: string;
  orderId: string;
};

export interface EmailAdapter {
  sendEnrollmentConfirmation(params: EnrollmentConfirmationParams): Promise<void>;
  sendPurchaseReceipt(params: PurchaseReceiptParams): Promise<void>;
}

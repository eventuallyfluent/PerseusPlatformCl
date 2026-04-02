/**
 * Payment adapter contract.
 * Re-exported here for convenience so consumers can import from one place.
 */
export type {
  PaymentGatewayAdapter,
  CanonicalPaymentEvent,
  CanonicalEventType,
  CheckoutSessionParams,
  CheckoutSessionResult,
} from "@/types/index";

/**
 * Thrown by adapters for payment-specific failures.
 * Allows callers to distinguish payment errors from other errors.
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

import Link from "next/link";
import type { SalesPageCTA } from "@/types";

function formatPrice(amount: string, currency: string, billingInterval: string | null): string {
  const num = parseFloat(amount);
  if (isNaN(num) || num === 0) return "Free";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
  if (billingInterval === "MONTH") return `${formatted}/mo`;
  if (billingInterval === "YEAR") return `${formatted}/yr`;
  return formatted;
}

type Props = {
  cta: SalesPageCTA;
  courseSlug: string;
};

export function CTASection({ cta, courseSlug }: Props) {
  if (!cta.offers.length) return null;

  return (
    <section style={{ background: "linear-gradient(135deg, #160830, var(--bg-surface))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2
          className="font-display text-3xl sm:text-4xl mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Ready to enroll?
        </h2>
        <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
          Get lifetime access. Learn at your own pace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          {cta.offers.map((offer) => {
            const defaultPrice =
              offer.prices.find((p) => p.isDefault) ?? offer.prices[0];
            if (!defaultPrice) return null;

            return (
              <Link
                key={offer.id}
                href={`/checkout/${courseSlug}?offerId=${offer.id}&priceId=${defaultPrice.id}`}
                className="font-bold px-8 py-4 rounded-xl transition-colors shadow-lg text-center min-w-[200px] text-white border"
                style={{ background: "var(--brand)", borderColor: "var(--brand)" }}
              >
                <div className="text-lg">
                  {formatPrice(
                    defaultPrice.amount,
                    defaultPrice.currency,
                    defaultPrice.billingInterval
                  )}
                </div>
                <div className="text-sm font-normal mt-0.5" style={{ color: "var(--accent)" }}>
                  {offer.name}
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Secure checkout · Instant access · 30-day guarantee
        </p>
      </div>
    </section>
  );
}

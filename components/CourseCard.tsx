import Link from "next/link";
import Image from "next/image";

type Props = {
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  instructorName: string | null;
  /** Display price string e.g. "$99" or "Free" */
  priceLabel: string;
};

export function CourseCard({
  slug,
  title,
  subtitle,
  thumbnailUrl,
  instructorName,
  priceLabel,
}: Props) {
  return (
    <Link
      href={`/course/${slug}`}
      className="group flex flex-col bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--accent)] transition-all hover:shadow-lg hover:shadow-[var(--brand)]/10"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[var(--bg-elevated)] overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-[var(--border)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        {instructorName && (
          <p className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide">
            {instructorName}
          </p>
        )}
        <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--text-primary)]">{priceLabel}</span>
          <span className="text-xs text-[var(--accent)] font-medium group-hover:underline">
            View course →
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Derive a display price from a course's offers array */
export function getPriceLabel(
  offers: Array<{ prices: Array<{ amount: unknown; currency: string }> }>
): string {
  if (!offers.length) return "Free";
  const firstPrice = offers[0]?.prices?.[0];
  if (!firstPrice) return "Free";
  const amount = parseFloat(String(firstPrice.amount));
  if (isNaN(amount) || amount === 0) return "Free";
  const currency = firstPrice.currency.toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

// Inline styles keep these tokens working without Tailwind arbitrary values
const VARIANTS: Record<string, { bg: string; color: string }> = {
  PUBLISHED:  { bg: "rgba(52,211,153,0.12)",  color: "var(--success)" },
  COMPLETED:  { bg: "rgba(52,211,153,0.12)",  color: "var(--success)" },
  ACTIVE:     { bg: "rgba(52,211,153,0.12)",  color: "var(--success)" },
  DRAFT:      { bg: "rgba(167,139,202,0.12)", color: "var(--text-secondary)" },
  INACTIVE:   { bg: "rgba(167,139,202,0.12)", color: "var(--text-secondary)" },
  PENDING:    { bg: "rgba(251,191,36,0.15)",  color: "var(--warning)" },
  RUNNING:    { bg: "rgba(251,191,36,0.15)",  color: "var(--warning)" },
  FAILED:     { bg: "rgba(248,113,113,0.12)", color: "var(--danger)" },
  ARCHIVED:   { bg: "rgba(248,113,113,0.12)", color: "var(--danger)" },
  REFUNDED:   { bg: "rgba(192,132,252,0.12)", color: "var(--accent)" },
};

export function StatusBadge({ status }: { status: string }) {
  const v = VARIANTS[status] ?? { bg: "rgba(167,139,202,0.12)", color: "var(--text-secondary)" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: v.bg, color: v.color }}
    >
      {status}
    </span>
  );
}

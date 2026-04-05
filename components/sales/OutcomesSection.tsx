import type { SalesPageOutcomes } from "@/types";

export function OutcomesSection({ outcomes }: { outcomes: SalesPageOutcomes }) {
  if (!outcomes.items.length) return null;
  return (
    <section className="border-b" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
          What you&apos;ll learn
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outcomes.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(192,132,252,0.15)" }}
              >
                <svg className="w-3 h-3" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { SalesPageOutcomes } from "@/types";

export function OutcomesSection({ outcomes }: { outcomes: SalesPageOutcomes }) {
  if (!outcomes.items.length) return null;
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          What you&apos;ll learn
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outcomes.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import type { SalesPageFAQ } from "@/types";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-semibold text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
          {question}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-secondary)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{answer}</p>
      )}
    </div>
  );
}

export function FAQSection({ faq }: { faq: SalesPageFAQ }) {
  if (!faq.items.length) return null;
  return (
    <section className="border-b" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
          Frequently asked questions
        </h2>
        <div>
          {faq.items.map((item, i) => (
            <FAQItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true); // Always show success — never reveal if email exists
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>Perseus</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Reset your password</p>
        </div>

        {submitted ? (
          <div
            className="rounded-2xl p-8 border text-center"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(52,211,153,0.12)" }}
            >
              <svg className="w-7 h-7" style={{ color: "var(--success)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Check your email</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. It expires in 1 hour.
            </p>
            <Link href="/login" className="mt-6 inline-block text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "var(--accent)" }}>
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-8 space-y-5 border"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Enter the email address for your account and we&apos;ll send you a reset link.
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 border"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2 border" style={{ color: "var(--danger)", background: "rgba(248,113,113,0.08)", borderColor: "var(--danger)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-white"
              style={{ background: "var(--brand)" }}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              Remember it?{" "}
              <Link href="/login" className="font-medium hover:opacity-80" style={{ color: "var(--accent)" }}>Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
        <div className="rounded-2xl p-8 border text-center max-w-sm w-full" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <p className="font-medium mb-3" style={{ color: "var(--danger)" }}>Invalid reset link.</p>
          <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>Request a new one →</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Reset failed. The link may have expired.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
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
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Choose a new password</p>
        </div>

        {success ? (
          <div className="rounded-2xl p-8 border text-center" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(52,211,153,0.12)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--success)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Password updated!</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Redirecting you to sign in…</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-8 space-y-5 border"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>New password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 border"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
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
              {loading ? "Updating…" : "Set new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

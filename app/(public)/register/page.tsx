"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (typeof data.error === "object") {
          setErrors(data.error);
        } else {
          setGlobalError(data.error ?? "Registration failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Account created but auto-login failed — redirect to login
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setGlobalError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const fieldError = (key: string) =>
    errors[key]?.[0] ? (
      <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors[key][0]}</p>
    ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>Perseus</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5 border"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Smith"
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 border"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            {fieldError("name")}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 border"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            {fieldError("email")}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 border"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            {fieldError("password")}
          </div>

          {globalError && (
            <p
              className="text-sm rounded-lg px-3 py-2 border"
              style={{ color: "var(--danger)", background: "rgba(248,113,113,0.08)", borderColor: "var(--danger)" }}
            >
              {globalError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-white"
            style={{ background: "var(--brand)" }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--brand)"; }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

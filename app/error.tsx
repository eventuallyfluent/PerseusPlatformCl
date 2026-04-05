"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--bg-base)" }}
    >
      <p
        className="font-mono text-6xl font-bold mb-4 opacity-20"
        style={{ color: "var(--danger)" }}
      >
        500
      </p>
      <h1 className="font-display text-2xl sm:text-3xl mb-3" style={{ color: "var(--text-primary)" }}>
        Something went wrong
      </h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--text-secondary)" }}>
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="font-bold px-6 py-2.5 rounded-full text-sm text-white transition-colors"
          style={{ background: "var(--brand)" }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="font-bold px-6 py-2.5 rounded-full text-sm border transition-colors"
          style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
        >
          Go home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-xs opacity-30" style={{ color: "var(--text-secondary)" }}>
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}

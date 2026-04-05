"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function CheckoutInner() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const offerId = searchParams.get("offerId") ?? "";
  const priceId = searchParams.get("priceId") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId || !priceId) return;
    initiate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId, priceId]);

  async function initiate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, priceId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Checkout failed (${res.status})`);
      }

      const { url } = await res.json();
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (!offerId || !priceId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="font-medium" style={{ color: "var(--danger)" }}>Invalid checkout link.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm hover:underline"
          style={{ color: "var(--accent)" }}
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      {loading && (
        <>
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-6"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--brand)" }}
          />
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Preparing your checkout…
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            You will be redirected to our secure payment page shortly.
          </p>
        </>
      )}
      {error && (
        <>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(248,113,113,0.12)" }}
          >
            <svg className="w-6 h-6" style={{ color: "var(--danger)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Something went wrong
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{error}</p>
          <button
            onClick={initiate}
            className="font-bold px-6 py-3 rounded-xl transition-colors text-white"
            style={{ background: "var(--brand)" }}
          >
            Try again
          </button>
          <button
            onClick={() => router.push(`/course/${params.slug}`)}
            className="block mt-4 text-sm mx-auto hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back to course
          </button>
        </>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--brand)" }}
          />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

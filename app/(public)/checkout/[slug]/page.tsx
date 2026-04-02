"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

// ─── Inner component (reads searchParams — must be inside Suspense) ────────────

function CheckoutInner() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const offerId = searchParams.get("offerId") ?? "";
  const priceId = searchParams.get("priceId") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-initiate on mount if both IDs are present
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
        <p className="text-red-600 font-medium">Invalid checkout link.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-indigo-600 hover:underline"
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
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Preparing your checkout…</h1>
          <p className="text-gray-500 text-sm">You will be redirected to our secure payment page shortly.</p>
        </>
      )}
      {error && (
        <>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={initiate}
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push(`/course/${params.slug}`)}
            className="block mt-4 text-sm text-gray-500 hover:text-gray-700 mx-auto"
          >
            ← Back to course
          </button>
        </>
      )}
    </div>
  );
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enrollment Confirmed",
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let courseSlug: string | null = null;
  let courseTitle: string | null = null;

  if (session_id) {
    const order = await db.order.findFirst({
      where: { gatewayOrderId: session_id },
      include: {
        offer: {
          include: {
            course: { select: { slug: true, title: true } },
          },
        },
      },
    });
    if (order) {
      courseSlug = order.offer.course.slug;
      courseTitle = order.offer.course.title;
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(52,211,153,0.12)" }}
        >
          <svg
            className="w-10 h-10"
            style={{ color: "var(--success)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display text-3xl mb-4" style={{ color: "var(--text-primary)" }}>
          You&apos;re enrolled!
        </h1>

        {courseTitle ? (
          <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
            Welcome to{" "}
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{courseTitle}</span>.
          </p>
        ) : (
          <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
            Your enrollment has been confirmed.
          </p>
        )}

        <p className="text-sm mb-10" style={{ color: "var(--text-secondary)" }}>
          A confirmation email is on its way. Ready to start learning?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {courseSlug ? (
            <Link
              href={`/learn/${courseSlug}`}
              className="font-bold px-8 py-4 rounded-xl transition-colors text-white"
              style={{ background: "var(--brand)" }}
            >
              Start learning →
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="font-bold px-8 py-4 rounded-xl transition-colors text-white"
              style={{ background: "var(--brand)" }}
            >
              Go to my courses →
            </Link>
          )}
          <Link
            href="/courses"
            className="font-bold px-8 py-4 rounded-xl transition-colors border"
            style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
          >
            Browse more courses
          </Link>
        </div>
      </div>
    </div>
  );
}

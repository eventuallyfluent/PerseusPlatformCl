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

  // Look up the order from the gateway session ID
  let courseSlug: string | null = null;
  let courseTitle: string | null = null;

  if (session_id) {
    // gatewayOrderId stores the Stripe session ID (set in StripeAdapter)
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
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          You&apos;re enrolled!
        </h1>

        {courseTitle ? (
          <p className="text-gray-600 text-lg mb-2">
            Welcome to{" "}
            <span className="font-semibold text-gray-900">{courseTitle}</span>.
          </p>
        ) : (
          <p className="text-gray-600 text-lg mb-2">
            Your enrollment has been confirmed.
          </p>
        )}

        <p className="text-gray-500 text-sm mb-10">
          A confirmation email is on its way. Ready to start learning?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {courseSlug ? (
            <Link
              href={`/learn/${courseSlug}`}
              className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Start learning →
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Go to my courses →
            </Link>
          )}
          <Link
            href="/courses"
            className="border border-gray-300 text-gray-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Browse more courses
          </Link>
        </div>
      </div>
    </div>
  );
}

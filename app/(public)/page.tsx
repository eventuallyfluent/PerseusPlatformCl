import type { Metadata } from "next";
import Link from "next/link";
import { listCourses } from "@/lib/courses/service";
import { CourseCard, getPriceLabel } from "@/components/CourseCard";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Perseus Platform — Learn skills that actually matter",
  description:
    "Expert-led courses designed to take you from beginner to confident. Work at your own pace. Learn for life.",
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "Perseus Platform — Learn skills that actually matter",
    description:
      "Expert-led courses designed to take you from beginner to confident. Work at your own pace. Learn for life.",
    siteName: "Perseus Platform",
  },
  twitter: {
    card: "summary",
    title: "Perseus Platform",
    description: "Expert-led courses. Learn at your own pace.",
  },
};

export default async function HomePage() {
  const courses = await listCourses({ status: "PUBLISHED" });
  const featured = courses.slice(0, 3);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Learn skills that<br />
            <span className="text-indigo-200">actually matter.</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Expert-led courses designed to take you from beginner to confident.
            Work at your own pace. Learn for life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-base shadow-lg"
            >
              Browse all courses
            </Link>
            <Link
              href="/dashboard"
              className="border-2 border-white/60 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base"
            >
              My learning →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap justify-center gap-10 text-center">
          {[
            ["Expert instructors", "Real practitioners, not just teachers"],
            ["Self-paced learning", "Go at your own speed, forever"],
            ["Lifetime access", "Buy once, keep forever"],
          ].map(([title, sub]) => (
            <div key={title} className="min-w-[140px]">
              <p className="font-bold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured courses ────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured courses
            </h2>
            <Link
              href="/courses"
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((course) => (
              <CourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                subtitle={course.subtitle}
                thumbnailUrl={course.thumbnailUrl}
                instructorName={course.instructor?.name ?? null}
                priceLabel={getPriceLabel(course.offers)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA band ────────────────────────────────────────────────────────── */}
      <section className="bg-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-indigo-100 mb-8 text-lg max-w-xl mx-auto">
            Join thousands of students already building real skills.
          </p>
          <Link
            href="/courses"
            className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors inline-block shadow-lg"
          >
            Browse courses
          </Link>
        </div>
      </section>
    </>
  );
}

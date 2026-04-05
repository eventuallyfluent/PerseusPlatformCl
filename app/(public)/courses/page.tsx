import type { Metadata } from "next";
import { listCourses } from "@/lib/courses/service";
import { CourseCard, getPriceLabel } from "@/components/CourseCard";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "All Courses",
  description: "Browse our full library of expert-led courses. Learn at your own pace with lifetime access.",
  alternates: { canonical: `${BASE_URL}/courses` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/courses`,
    title: "All Courses — Perseus Arcane Academy",
    description: "Browse our full library of expert-led courses. Learn at your own pace with lifetime access.",
    siteName: "Perseus Arcane Academy",
  },
  twitter: {
    card: "summary",
    title: "All Courses — Perseus Arcane Academy",
    description: "Expert-led courses. Browse and enroll today.",
  },
};

export default async function CoursesPage() {
  const courses = await listCourses({ status: "PUBLISHED" });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
          Perseus Arcane Academy
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          All Courses
        </h1>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          {courses.length === 0
            ? "No courses available yet. Check back soon."
            : `${courses.length} course${courses.length === 1 ? "" : "s"} available`}
        </p>
      </div>

      {/* Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
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
      ) : (
        <div className="text-center py-24" style={{ color: "var(--text-secondary)" }}>
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-xl font-medium" style={{ color: "var(--text-primary)" }}>No courses yet</p>
          <p className="text-sm mt-2">Come back soon — new courses are on the way.</p>
        </div>
      )}
    </div>
  );
}

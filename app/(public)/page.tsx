import type { Metadata } from "next";
import Link from "next/link";
import { listCourses } from "@/lib/courses/service";
import { CourseCard, getPriceLabel } from "@/components/CourseCard";
import { getAllSettings } from "@/lib/settings/service";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  return {
    title: `${s["site.name"]} — ${s["site.tagline"]}`,
    description: s["hero.subtext"],
    openGraph: {
      type: "website",
      url: BASE_URL,
      title: `${s["site.name"]} — ${s["site.tagline"]}`,
      description: s["hero.subtext"],
      siteName: s["site.name"],
    },
    twitter: {
      card: "summary",
      title: s["site.name"],
      description: s["site.tagline"],
    },
  };
}

export default async function HomePage() {
  const [courses, s] = await Promise.all([
    listCourses({ status: "PUBLISHED" }),
    getAllSettings(),
  ]);
  const featured = courses.slice(0, 3);

  const trustItems = [
    { title: s["trust.item1.title"], sub: s["trust.item1.sub"] },
    { title: s["trust.item2.title"], sub: s["trust.item2.sub"] },
    { title: s["trust.item3.title"], sub: s["trust.item3.sub"] },
  ];

  // Headline may contain a literal \n for line break
  const headlineParts = s["hero.headline"].split("\n");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="text-center py-28 px-4 sm:px-6"
        style={{ background: "linear-gradient(135deg, var(--bg-base) 0%, #160830 50%, var(--bg-base) 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: "var(--accent)" }}>
            {s["site.name"]}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
            {headlineParts.map((part, i) => (
              <span key={i}>
                {i === headlineParts.length - 1 ? (
                  <span style={{ color: "var(--accent)" }}>{part}</span>
                ) : (
                  <>{part}<br /></>
                )}
              </span>
            ))}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
            {s["hero.subtext"]}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="font-bold px-8 py-4 rounded-full transition-colors text-base text-white"
              style={{ background: "var(--brand)" }}
            >
              {s["hero.cta_primary"]}
            </Link>
            <Link
              href="/dashboard"
              className="font-bold px-8 py-4 rounded-full transition-colors text-base border"
              style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
            >
              {s["hero.cta_secondary"]}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────────── */}
      <section className="border-y" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap justify-center gap-10 text-center">
          {trustItems.map(({ title, sub }) => (
            <div key={title} className="min-w-[140px]">
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>{title}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured courses ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Featured courses
            </h2>
            <Link
              href="/courses"
              className="text-sm font-semibold hover:underline"
              style={{ color: "var(--accent)" }}
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

      {/* ── CTA band ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #160830, var(--bg-surface))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl mb-4" style={{ color: "var(--text-primary)" }}>
            {s["cta.headline"]}
          </h2>
          <p className="mb-8 text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {s["cta.subtext"]}
          </p>
          <Link
            href="/courses"
            className="font-bold px-8 py-4 rounded-full transition-colors inline-block text-white"
            style={{ background: "var(--brand)" }}
          >
            {s["cta.button"]}
          </Link>
        </div>
      </section>
    </>
  );
}

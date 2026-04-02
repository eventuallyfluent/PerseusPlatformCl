import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseBySlug } from "@/lib/courses/service";
import { getOrGenerateSalesPage } from "@/lib/sales-pages/service";
import type { GeneratedSalesPagePayload } from "@/types";

import { SalesHero } from "@/components/sales/SalesHero";
import { OutcomesSection } from "@/components/sales/OutcomesSection";
import { CurriculumSection } from "@/components/sales/CurriculumSection";
import { InstructorSection } from "@/components/sales/InstructorSection";
import { TestimonialsSection } from "@/components/sales/TestimonialsSection";
import { FAQSection } from "@/components/sales/FAQSection";
import { CTASection } from "@/components/sales/CTASection";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  const description = course.subtitle ?? course.description ?? "Enroll now and start learning.";
  const imageUrl = course.thumbnailUrl ?? undefined;
  const canonicalUrl = `${BASE_URL}/course/${slug}`;

  return {
    title: course.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: course.title,
      description,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1280, height: 720, alt: course.title }],
      }),
      siteName: "Perseus Platform",
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: course.title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function CourseSalesPage({ params }: Props) {
  const { slug } = await params;

  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "PUBLISHED") notFound();

  // Get or auto-generate the sales page payload
  const page = await getOrGenerateSalesPage(course.id);
  const payload = page.payload as unknown as GeneratedSalesPagePayload;

  // ── JSON-LD: Course structured data ─────────────────────────────────────────
  const totalLessons = payload.curriculum.modules.reduce(
    (n, m) => n + m.lessonCount,
    0
  );
  const lowestPrice = payload.cta.offers
    .flatMap((o) => o.prices)
    .reduce<number | null>((min, p) => {
      const amt = parseFloat(p.amount);
      return min === null || amt < min ? amt : min;
    }, null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle ?? course.description ?? "",
    url: `${BASE_URL}/course/${slug}`,
    ...(course.thumbnailUrl && { image: course.thumbnailUrl }),
    provider: {
      "@type": "Organization",
      name: "Perseus Platform",
      sameAs: BASE_URL,
    },
    instructor: {
      "@type": "Person",
      name: payload.instructor.name,
      ...(payload.instructor.bio && { description: payload.instructor.bio }),
    },
    ...(totalLessons > 0 && { numberOfCredits: totalLessons }),
    ...(lowestPrice !== null && {
      offers: {
        "@type": "Offer",
        price: lowestPrice,
        priceCurrency: payload.cta.offers[0]?.prices[0]?.currency?.toUpperCase() ?? "USD",
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/course/${slug}`,
      },
    }),
    ...(payload.outcomes.items.length > 0 && {
      teaches: payload.outcomes.items,
    }),
    ...(payload.audience.items.length > 0 && {
      audience: {
        "@type": "Audience",
        audienceType: payload.audience.items.join(", "),
      },
    }),
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SalesHero
        hero={payload.hero}
        video={payload.video}
        instructorName={payload.instructor.name}
      />

      {/* Sticky enroll button — mobile only */}
      {payload.cta.offers.length > 0 && (
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm lg:hidden">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="font-bold text-gray-900 text-sm truncate">{payload.hero.title}</p>
            <a
              href="#enroll"
              className="bg-indigo-600 text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              Enroll now
            </a>
          </div>
        </div>
      )}

      {/* Description */}
      {payload.description && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              About this course
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              {payload.description.body}
            </p>
          </div>
        </section>
      )}

      <OutcomesSection outcomes={payload.outcomes} />

      {/* Audience + Includes row */}
      {(payload.audience.items.length > 0 || payload.includes.items.length > 0) && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 gap-12">
            {payload.audience.items.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5">Who this is for</h2>
                <ul className="space-y-3">
                  {payload.audience.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-indigo-500 font-bold mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {payload.includes.items.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5">This course includes</h2>
                <ul className="space-y-3">
                  {payload.includes.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <CurriculumSection curriculum={payload.curriculum} />
      <InstructorSection instructor={payload.instructor} />
      <TestimonialsSection testimonials={payload.testimonials} />
      <FAQSection faq={payload.faq} />

      <div id="enroll">
        <CTASection cta={payload.cta} courseSlug={slug} />
      </div>
    </>
  );
}

import { redirect, notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses/service";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * /learn/[slug] — redirects to the first lesson.
 * No layout, no render — pure server redirect.
 */
export default async function LearnCoursePage({ params }: Props) {
  const { slug } = await params;

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  // Find the first lesson across all modules (ordered by module.position, lesson.position)
  const firstLesson = course.modules
    .sort((a, b) => a.position - b.position)
    .flatMap((m) => m.lessons.sort((a, b) => a.position - b.position))
    .at(0);

  if (!firstLesson) {
    // Course exists but has no lessons yet
    notFound();
  }

  redirect(`/learn/${slug}/${firstLesson.id}`);
}

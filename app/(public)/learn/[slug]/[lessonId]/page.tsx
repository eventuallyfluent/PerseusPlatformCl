import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourseBySlug } from "@/lib/courses/service";
import { getLesson } from "@/lib/lessons/service";
import { LessonSidebar } from "@/components/learn/LessonSidebar";
import { VideoPlayer } from "@/components/learn/VideoPlayer";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;

  // Load course with full module/lesson tree for sidebar
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  // Load the active lesson
  const lesson = await getLesson(lessonId);
  if (!lesson) notFound();

  // ── Enrollment gate ─────────────────────────────────────────────────────────
  // Preview lessons are public. All others require an active enrollment.
  if (!lesson.isPreview) {
    const session = await auth();
    if (!session?.user?.id) {
      redirect(`/login?callbackUrl=/learn/${slug}/${lessonId}`);
    }
    const enrollment = await db.enrollment.findFirst({
      where: { userId: session.user.id, courseId: course.id },
    });
    if (!enrollment) {
      redirect(`/course/${slug}`);
    }
  }

  // Flatten all lessons in order to build prev/next navigation
  const allLessons = course.modules
    .sort((a, b) => a.position - b.position)
    .flatMap((m) => m.lessons.sort((a, b) => a.position - b.position));

  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  // Sidebar module shape
  const sidebarModules = course.modules
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons
        .sort((a, b) => a.position - b.position)
        .map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          isPreview: l.isPreview,
        })),
    }));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <LessonSidebar
        courseSlug={slug}
        courseTitle={course.title}
        modules={sidebarModules}
        activeLessonId={lessonId}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--bg-base)" }}>
        {/* Lesson content */}
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            {lesson.title}
          </h1>

          {/* VIDEO */}
          {(lesson.type === "VIDEO" || lesson.type === "MIXED") && lesson.videoUrl && (
            <div className="mb-8">
              <VideoPlayer src={lesson.videoUrl} title={lesson.title} />
            </div>
          )}

          {/* TEXT / MIXED content */}
          {lesson.content && (
            <div className="prose max-w-none">
              {lesson.content.split("\n").map((line, i) => (
                <p key={i}>{line || <>&nbsp;</>}</p>
              ))}
            </div>
          )}

          {/* DOWNLOAD */}
          {lesson.downloadUrl && (
            <div
              className="mt-8 p-5 rounded-xl flex items-center gap-4 border"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(192,132,252,0.12)" }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Lesson resource</p>
                <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{lesson.downloadUrl}</p>
              </div>
              <a
                href={lesson.downloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold px-5 py-2.5 rounded-lg transition-colors flex-shrink-0 text-white"
                style={{ background: "var(--brand)" }}
              >
                Download
              </a>
            </div>
          )}

          {/* Empty state */}
          {!lesson.videoUrl && !lesson.content && !lesson.downloadUrl && (
            <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
              <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>Content coming soon</p>
              <p className="text-sm mt-1">This lesson&apos;s content hasn&apos;t been published yet.</p>
            </div>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="border-t" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/learn/${slug}/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium transition-colors max-w-[45%]"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="truncate">{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            <span className="text-xs flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
              {lessonIndex + 1} / {allLessons.length}
            </span>

            {nextLesson ? (
              <Link
                href={`/learn/${slug}/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium transition-colors max-w-[45%] text-right"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="truncate">{nextLesson.title}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--success)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Course complete!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

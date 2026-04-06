import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourseBySlug } from "@/lib/courses/service";
import { getLesson } from "@/lib/lessons/service";
import { LessonSidebar } from "@/components/learn/LessonSidebar";
import { VideoPlayer } from "@/components/learn/VideoPlayer";
import { getCompletedLessonIds, isLessonUnlocked, daysUntilUnlock } from "@/lib/progress/service";

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

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lesson = await getLesson(lessonId);
  if (!lesson) notFound();

  // ── Enrollment gate + drip enforcement ──────────────────────────────────────
  let enrollment: { id: string; enrolledAt: Date } | null = null;
  let completedIds = new Set<string>();

  if (!lesson.isPreview) {
    const session = await auth();
    if (!session?.user?.id) {
      redirect(`/login?callbackUrl=/learn/${slug}/${lessonId}`);
    }
    enrollment = await db.enrollment.findFirst({
      where: { userId: session.user.id, courseId: course.id },
      select: { id: true, enrolledAt: true },
    });
    if (!enrollment) redirect(`/course/${slug}`);

    // Drip check — lesson may be locked even with enrollment
    const unlocked = isLessonUnlocked(lesson, enrollment);
    if (!unlocked) {
      const days = daysUntilUnlock(lesson, enrollment);
      redirect(`/learn/${slug}?drip=${lesson.id}&days=${days}`);
    }

    completedIds = await getCompletedLessonIds(session.user.id, course.id);
  }

  // Flatten all published lessons for nav
  const allLessons = course.modules
    .sort((a, b) => a.position - b.position)
    .flatMap((m) =>
      m.lessons
        .filter((l) => l.status === "PUBLISHED" || l.isPreview)
        .sort((a, b) => a.position - b.position)
    );

  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;
  const isCompleted = completedIds.has(lessonId);
  const totalPublished = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent = totalPublished === 0 ? 0 : Math.round((completedCount / totalPublished) * 100);

  const sidebarModules = course.modules
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons
        .filter((l) => l.status === "PUBLISHED" || l.isPreview)
        .sort((a, b) => a.position - b.position)
        .map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          isPreview: l.isPreview,
          isCompleted: completedIds.has(l.id),
          isLocked: !isLessonUnlocked(l, enrollment),
        })),
    }));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <LessonSidebar
        courseSlug={slug}
        courseTitle={course.title}
        modules={sidebarModules}
        activeLessonId={lessonId}
        progressPercent={progressPercent}
      />

      <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--bg-base)" }}>
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8">

          {/* Lesson header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {lesson.title}
            </h1>
            {enrollment && (
              <MarkCompleteButton lessonId={lessonId} isCompleted={isCompleted} />
            )}
          </div>

          {/* VIDEO */}
          {(lesson.type === "VIDEO" || lesson.type === "MIXED") && lesson.videoUrl && (
            <div className="mb-8">
              <VideoPlayer src={lesson.videoUrl} title={lesson.title} />
            </div>
          )}

          {/* TEXT content */}
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(192,132,252,0.12)" }}>
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

          {!lesson.videoUrl && !lesson.content && !lesson.downloadUrl && (
            <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
              <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>Content coming soon</p>
              <p className="text-sm mt-1">This lesson&apos;s content hasn&apos;t been published yet.</p>
            </div>
          )}
        </div>

        {/* Prev / Next nav */}
        <div className="border-t" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link href={`/learn/${slug}/${prevLesson.id}`} className="flex items-center gap-2 text-sm font-medium transition-colors max-w-[45%]" style={{ color: "var(--text-secondary)" }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="truncate">{prevLesson.title}</span>
              </Link>
            ) : <div />}

            <span className="text-xs flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
              {lessonIndex + 1} / {allLessons.length}
            </span>

            {nextLesson ? (
              <Link href={`/learn/${slug}/${nextLesson.id}`} className="flex items-center gap-2 text-sm font-medium transition-colors max-w-[45%] text-right" style={{ color: "var(--text-secondary)" }}>
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

// ── Mark Complete button — client component inline ──────────────────────────
function MarkCompleteButton({ lessonId, isCompleted }: { lessonId: string; isCompleted: boolean }) {
  // We need "use client" for interactivity — render as a form POST to the API
  // Using a plain form action to avoid making the whole page client-side
  return (
    <form
      action="/api/progress"
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        });
        window.location.reload();
      }}
    >
      <button
        type="submit"
        className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
        style={
          isCompleted
            ? { background: "rgba(52,211,153,0.12)", borderColor: "var(--success)", color: "var(--success)" }
            : { background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }
        }
      >
        <svg className="w-4 h-4" fill={isCompleted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {isCompleted ? "Completed" : "Mark complete"}
      </button>
    </form>
  );
}

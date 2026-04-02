import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
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
    // Override root layout's <main> padding for full-height player layout
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <LessonSidebar
        courseSlug={slug}
        courseTitle={course.title}
        modules={sidebarModules}
        activeLessonId={lessonId}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {/* Lesson content */}
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            {lesson.title}
          </h1>

          {/* VIDEO */}
          {(lesson.type === "VIDEO" || lesson.type === "MIXED") && lesson.videoUrl && (
            <div className="mb-8">
              <VideoPlayer src={lesson.videoUrl} title={lesson.title} />
            </div>
          )}

          {/* TEXT / MIXED content — rendered as plain text (markdown rendering added in Phase 9) */}
          {lesson.content && (
            <div className="prose max-w-none text-gray-700">
              {lesson.content.split("\n").map((line, i) => (
                <p key={i}>{line || <>&nbsp;</>}</p>
              ))}
            </div>
          )}

          {/* DOWNLOAD */}
          {lesson.downloadUrl && (
            <div className="mt-8 p-5 bg-white border border-gray-200 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Lesson resource</p>
                <p className="text-sm text-gray-500 truncate">{lesson.downloadUrl}</p>
              </div>
              <a
                href={lesson.downloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
              >
                Download
              </a>
            </div>
          )}

          {/* Empty state */}
          {!lesson.videoUrl && !lesson.content && !lesson.downloadUrl && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Content coming soon</p>
              <p className="text-sm mt-1">This lesson&apos;s content hasn&apos;t been published yet.</p>
            </div>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/learn/${slug}/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors max-w-[45%]"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="truncate">{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            <span className="text-xs text-gray-400 flex-shrink-0">
              {lessonIndex + 1} / {allLessons.length}
            </span>

            {nextLesson ? (
              <Link
                href={`/learn/${slug}/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors max-w-[45%] text-right"
              >
                <span className="truncate">{nextLesson.title}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="text-sm text-green-600 font-medium flex items-center gap-1">
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

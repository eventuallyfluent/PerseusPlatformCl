"use client";

import Link from "next/link";
import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  type: string;
  isPreview: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Props = {
  courseSlug: string;
  courseTitle: string;
  modules: Module[];
  activeLessonId: string;
  progressPercent?: number; // 0-100
};

const TYPE_ICON: Record<string, string> = {
  VIDEO: "▶",
  TEXT: "📄",
  DOWNLOAD: "⬇",
  MIXED: "◈",
};

export function LessonSidebar({ courseSlug, courseTitle, modules, activeLessonId, progressPercent }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div
        className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Course content
        </button>
        <span className="text-xs ml-auto truncate" style={{ color: "var(--text-secondary)" }}>{courseTitle}</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`lg:w-80 lg:min-h-screen flex-shrink-0 flex flex-col border-r ${collapsed ? "hidden" : "block"} lg:flex`}
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        {/* Course title + back */}
        <div className="px-5 py-5 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <Link
            href={`/course/${courseSlug}`}
            className="text-xs font-medium uppercase tracking-wide hover:underline"
            style={{ color: "var(--accent)" }}
          >
            ← Back to course
          </Link>
          <p className="text-sm font-semibold mt-2 leading-snug" style={{ color: "var(--text-primary)" }}>
            {courseTitle}
          </p>

          {/* Progress bar */}
          {progressPercent !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Your progress</span>
                <span className="text-xs font-semibold" style={{ color: progressPercent === 100 ? "var(--success)" : "var(--text-secondary)" }}>
                  {progressPercent}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPercent}%`,
                    background: progressPercent === 100 ? "var(--success)" : "var(--brand)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Module / lesson tree */}
        <nav className="overflow-y-auto flex-1">
          {modules.map((mod) => (
            <div key={mod.id} className="border-b" style={{ borderColor: "var(--border)" }}>
              <p
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
              >
                {mod.title}
              </p>
              <ul>
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;
                  const isLocked = lesson.isLocked && !lesson.isPreview;

                  return (
                    <li key={lesson.id}>
                      {isLocked ? (
                        <div
                          className="flex items-start gap-3 px-5 py-3 text-sm opacity-50 cursor-not-allowed"
                          style={{ color: "var(--text-secondary)" }}
                          title="This lesson unlocks later"
                        >
                          <span className="mt-0.5 text-xs w-4 text-center flex-shrink-0">🔒</span>
                          <span className="flex-1 leading-snug">{lesson.title}</span>
                        </div>
                      ) : (
                        <Link
                          href={`/learn/${courseSlug}/${lesson.id}`}
                          className="flex items-start gap-3 px-5 py-3 text-sm transition-colors"
                          style={{
                            background: isActive ? "var(--brand)" : undefined,
                            color: isActive ? "#fff" : "var(--text-primary)",
                          }}
                          onClick={() => setCollapsed(true)}
                        >
                          <span className="mt-0.5 text-xs w-4 text-center flex-shrink-0 opacity-60">
                            {lesson.isCompleted
                              ? <span style={{ color: isActive ? "#fff" : "var(--success)" }}>✓</span>
                              : TYPE_ICON[lesson.type] ?? "•"}
                          </span>
                          <span className="flex-1 leading-snug">{lesson.title}</span>
                          {lesson.isPreview && !isActive && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 self-center"
                              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                            >
                              Free
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

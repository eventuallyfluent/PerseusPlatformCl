"use client";

import Link from "next/link";
import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  type: string;
  isPreview: boolean;
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
};

const TYPE_ICON: Record<string, string> = {
  VIDEO: "▶",
  TEXT: "📄",
  DOWNLOAD: "⬇",
  MIXED: "◈",
};

export function LessonSidebar({ courseSlug, courseTitle, modules, activeLessonId }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 text-white border-b border-gray-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Course content
        </button>
        <span className="text-gray-400 text-xs ml-auto truncate">{courseTitle}</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          lg:w-80 lg:min-h-screen bg-gray-900 text-gray-100 flex-shrink-0
          ${collapsed ? "hidden" : "block"} lg:block
        `}
      >
        {/* Course title header */}
        <div className="px-5 py-5 border-b border-gray-700">
          <Link
            href={`/course/${courseSlug}`}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium uppercase tracking-wide"
          >
            ← Back to sales page
          </Link>
          <p className="text-sm font-semibold text-white mt-2 leading-snug">{courseTitle}</p>
        </div>

        {/* Module / lesson tree */}
        <nav className="overflow-y-auto">
          {modules.map((mod) => (
            <div key={mod.id} className="border-b border-gray-800">
              <p className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-800/50">
                {mod.title}
              </p>
              <ul>
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/learn/${courseSlug}/${lesson.id}`}
                        className={`
                          flex items-start gap-3 px-5 py-3 text-sm transition-colors
                          ${isActive
                            ? "bg-indigo-600 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                        onClick={() => setCollapsed(true)}
                      >
                        <span className="mt-0.5 text-xs opacity-60 w-4 text-center flex-shrink-0">
                          {TYPE_ICON[lesson.type] ?? "•"}
                        </span>
                        <span className="flex-1 leading-snug">{lesson.title}</span>
                        {lesson.isPreview && !isActive && (
                          <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded flex-shrink-0 self-center">
                            Free
                          </span>
                        )}
                      </Link>
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

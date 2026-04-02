"use client";

import { useState } from "react";
import type { SalesPageCurriculum, SalesPageLesson } from "@/types";

const LESSON_ICONS: Record<string, string> = {
  VIDEO: "▶",
  TEXT: "📄",
  DOWNLOAD: "⬇",
  MIXED: "◈",
};

function LessonRow({ lesson }: { lesson: SalesPageLesson }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 text-sm text-gray-700">
      <span className="text-xs text-gray-400 w-5 text-center">
        {LESSON_ICONS[lesson.type] ?? "•"}
      </span>
      <span className="flex-1">{lesson.title}</span>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {lesson.isPreview && (
          <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-medium">
            Preview
          </span>
        )}
        {lesson.drip_days != null && lesson.drip_days > 0 && (
          <span>Day {lesson.drip_days}</span>
        )}
      </div>
    </div>
  );
}

function ModuleAccordion({
  module,
  index,
}: {
  module: SalesPageCurriculum["modules"][number];
  index: number;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div>
          <span className="font-semibold text-gray-900">{module.title}</span>
          <span className="ml-3 text-sm text-gray-500">
            {module.lessonCount} lesson{module.lessonCount !== 1 ? "s" : ""}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="divide-y divide-gray-100 bg-white">
          {module.lessons.map((lesson, i) => (
            <LessonRow key={i} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CurriculumSection({ curriculum }: { curriculum: SalesPageCurriculum }) {
  if (!curriculum.modules.length) return null;
  const totalLessons = curriculum.modules.reduce((n, m) => n + m.lessonCount, 0);

  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Course curriculum
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {curriculum.modules.length} module{curriculum.modules.length !== 1 ? "s" : ""} •{" "}
          {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
        </p>
        <div className="space-y-3">
          {curriculum.modules.map((mod, i) => (
            <ModuleAccordion key={i} module={mod} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

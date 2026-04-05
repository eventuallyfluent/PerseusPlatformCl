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
    <div
      className="flex items-center gap-3 py-2.5 px-4 text-sm border-t"
      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
    >
      <span className="text-xs w-5 text-center" style={{ color: "var(--text-secondary)" }}>
        {LESSON_ICONS[lesson.type] ?? "•"}
      </span>
      <span className="flex-1">{lesson.title}</span>
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
        {lesson.isPreview && (
          <span
            className="px-2 py-0.5 rounded font-medium"
            style={{ background: "rgba(192,132,252,0.15)", color: "var(--accent)" }}
          >
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
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: open ? "var(--bg-elevated)" : "var(--bg-surface)" }}
      >
        <div>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{module.title}</span>
          <span className="ml-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            {module.lessonCount} lesson{module.lessonCount !== 1 ? "s" : ""}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-secondary)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div style={{ background: "var(--bg-base)" }}>
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
    <section className="border-b" style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Course curriculum
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
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

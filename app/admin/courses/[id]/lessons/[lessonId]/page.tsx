import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getLesson } from "@/lib/lessons/service";
import { db } from "@/lib/db";
import { FormField } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { actionUpdateLesson } from "../../../actions";

export const metadata: Metadata = { title: "Edit Lesson" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string; lessonId: string }> };

export default async function EditLessonPage({ params }: Props) {
  const { id: courseId, lessonId } = await params;

  const [lesson, course] = await Promise.all([
    getLesson(lessonId),
    db.course.findUnique({ where: { id: courseId }, select: { title: true, slug: true } }),
  ]);

  if (!lesson || !course) notFound();

  const updateAction = actionUpdateLesson.bind(null, courseId, lessonId);

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <Link href="/admin/courses" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          Courses
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <Link href={`/admin/courses/${courseId}`} className="text-sm hover:opacity-80 transition-opacity truncate max-w-[160px]" style={{ color: "var(--text-secondary)" }}>
          {course.title}
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{lesson.title}</h1>
        <StatusBadge status={lesson.status} />
      </div>

      <form action={updateAction} className="space-y-6">
        {/* Core details */}
        <div className="rounded-2xl border p-7" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <h2 className="text-base font-bold mb-5" style={{ color: "var(--text-primary)" }}>Lesson details</h2>
          <div className="space-y-5">
            <FormField label="Title" name="title" required defaultValue={lesson.title} />

            <FormField label="Type" name="type">
              <option value="VIDEO" selected={lesson.type === "VIDEO"}>Video</option>
              <option value="TEXT" selected={lesson.type === "TEXT"}>Text</option>
              <option value="DOWNLOAD" selected={lesson.type === "DOWNLOAD"}>Download</option>
              <option value="MIXED" selected={lesson.type === "MIXED"}>Mixed</option>
            </FormField>

            <FormField label="Status" name="status">
              <option value="DRAFT" selected={lesson.status === "DRAFT"}>Draft</option>
              <option value="PUBLISHED" selected={lesson.status === "PUBLISHED"}>Published</option>
            </FormField>

            {/* Drip / preview row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Drip delay (days)"
                name="drip_days"
                type="number"
                defaultValue={lesson.drip_days ?? ""}
                placeholder="0 = immediate"
                hint="Days after enrollment before unlocking"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Free preview</label>
                <select
                  name="isPreview"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="false" selected={!lesson.isPreview}>No — enrolled only</option>
                  <option value="true" selected={lesson.isPreview}>Yes — publicly viewable</option>
                </select>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Visible before purchase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border p-7" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <h2 className="text-base font-bold mb-5" style={{ color: "var(--text-primary)" }}>Content</h2>
          <div className="space-y-5">
            <FormField
              label="Video URL"
              name="videoUrl"
              defaultValue={lesson.videoUrl ?? ""}
              placeholder="https://… (YouTube, Vimeo, direct MP4)"
              hint="Used for VIDEO and MIXED lesson types"
            />
            <FormField
              label="Text content"
              name="content"
              rows={10}
              defaultValue={lesson.content ?? ""}
              placeholder="Lesson body text (plain text, newlines supported)…"
            />
            <FormField
              label="Download URL"
              name="downloadUrl"
              defaultValue={lesson.downloadUrl ?? ""}
              placeholder="https://… (PDF, ZIP, etc.)"
              hint="Used for DOWNLOAD and MIXED lesson types"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="text-sm font-bold px-6 py-2.5 rounded-lg transition-colors text-white"
            style={{ background: "var(--brand)" }}
          >
            Save lesson
          </button>
          <Link
            href={`/admin/courses/${courseId}`}
            className="border text-sm font-bold px-6 py-2.5 rounded-lg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            ← Back to course
          </Link>
          {lesson.isPreview && (
            <Link
              href={`/learn/${course.slug}/${lessonId}`}
              target="_blank"
              className="text-sm hover:underline ml-auto"
              style={{ color: "var(--accent)" }}
            >
              Preview lesson ↗
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

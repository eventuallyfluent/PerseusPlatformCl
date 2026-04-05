import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCourse } from "@/lib/courses/service";
import { listInstructors } from "@/lib/instructors/service";
import { FormField } from "@/components/admin/FormField";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  actionUpdateCourse,
  actionDeleteCourse,
  actionCreateModule,
  actionDeleteModule,
  actionCreateLesson,
  actionDeleteLesson,
} from "../actions";

export const metadata: Metadata = { title: "Edit Course" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const miniInputCls = "flex-1 min-w-[140px] text-sm rounded-lg border px-3 py-1.5 focus:outline-none focus:ring-2";
const miniInputStyle = {
  background: "var(--bg-elevated)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
} as React.CSSProperties;

const miniSelectCls = "text-sm rounded-lg border px-2 py-1.5 focus:outline-none focus:ring-2";

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const [course, instructors] = await Promise.all([getCourse(id), listInstructors()]);
  if (!course) notFound();

  const updateAction = actionUpdateCourse.bind(null, id);
  const deleteAction = actionDeleteCourse.bind(null, id);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/courses" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          ← Courses
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 className="text-xl font-bold truncate" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
        <StatusBadge status={course.status} />
        <Link
          href={`/course/${course.slug}`}
          target="_blank"
          className="ml-auto text-xs hover:underline"
          style={{ color: "var(--accent)" }}
        >
          View sales page ↗
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Course form ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border p-7" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <h2 className="text-base font-bold mb-5" style={{ color: "var(--text-primary)" }}>Course details</h2>
            <form action={updateAction} className="space-y-5">
              <FormField label="Title" name="title" required defaultValue={course.title} />
              <FormField label="Slug" name="slug" required defaultValue={course.slug} hint="Changing the slug breaks existing URLs unless a redirect is created." />
              <FormField label="Subtitle" name="subtitle" defaultValue={course.subtitle ?? ""} />
              <FormField label="Description" name="description" rows={4} defaultValue={course.description ?? ""} />
              <FormField label="Thumbnail URL" name="thumbnailUrl" defaultValue={course.thumbnailUrl ?? ""} placeholder="https://…" />
              <FormField label="Preview video URL" name="previewVideoUrl" defaultValue={course.previewVideoUrl ?? ""} placeholder="https://…" />

              <FormField label="Instructor" name="instructorId" required>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id} selected={i.id === course.instructorId}>
                    {i.name}
                  </option>
                ))}
              </FormField>

              <FormField label="Status" name="status">
                <option value="DRAFT" selected={course.status === "DRAFT"}>Draft</option>
                <option value="PUBLISHED" selected={course.status === "PUBLISHED"}>Published</option>
                <option value="ARCHIVED" selected={course.status === "ARCHIVED"}>Archived</option>
              </FormField>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="text-sm font-bold px-5 py-2.5 rounded-lg transition-colors text-white"
                  style={{ background: "var(--brand)" }}
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>

          {/* ── Modules & Lessons ─────────────────────────────────────── */}
          <div className="rounded-2xl border p-7" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <h2 className="text-base font-bold mb-5" style={{ color: "var(--text-primary)" }}>Curriculum</h2>

            {course.modules.length === 0 && (
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>No modules yet. Add your first module below.</p>
            )}

            <div className="space-y-5">
              {course.modules
                .sort((a, b) => a.position - b.position)
                .map((mod) => {
                  const deleteModAction = actionDeleteModule.bind(null, id, mod.id);
                  const createLessonAction = actionCreateLesson.bind(null, id, mod.id);

                  return (
                    <div key={mod.id} className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                      {/* Module header */}
                      <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--bg-elevated)" }}>
                        <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>#{mod.position}</span>
                        <span className="font-semibold text-sm flex-1" style={{ color: "var(--text-primary)" }}>{mod.title}</span>
                        <form action={deleteModAction}>
                          <button
                            type="submit"
                            className="text-xs font-medium hover:opacity-70 transition-opacity"
                            style={{ color: "var(--danger)" }}
                            onClick={(e) => { if (!confirm("Delete this module and all its lessons?")) e.preventDefault(); }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>

                      {/* Lessons */}
                      <div>
                        {mod.lessons
                          .sort((a, b) => a.position - b.position)
                          .map((lesson) => {
                            const deleteLessonAction = actionDeleteLesson.bind(null, id, lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 px-5 py-3 border-t"
                                style={{ borderColor: "var(--border)" }}
                              >
                                <span className="text-xs font-mono w-4" style={{ color: "var(--text-secondary)" }}>{lesson.position}</span>
                                <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{lesson.title}</span>
                                <StatusBadge status={lesson.status} />
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{lesson.type}</span>
                                <form action={deleteLessonAction}>
                                  <button
                                    type="submit"
                                    className="text-xs hover:opacity-70 transition-opacity"
                                    style={{ color: "var(--danger)" }}
                                    onClick={(e) => { if (!confirm("Delete this lesson?")) e.preventDefault(); }}
                                  >
                                    ×
                                  </button>
                                </form>
                              </div>
                            );
                          })}
                      </div>

                      {/* Add lesson form */}
                      <form
                        action={createLessonAction}
                        className="px-5 py-3 border-t flex gap-2 flex-wrap"
                        style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}
                      >
                        <input
                          name="title"
                          placeholder="Lesson title"
                          required
                          className={miniInputCls}
                          style={miniInputStyle}
                        />
                        <select
                          name="type"
                          className={miniSelectCls}
                          style={miniInputStyle}
                        >
                          <option value="VIDEO">Video</option>
                          <option value="TEXT">Text</option>
                          <option value="DOWNLOAD">Download</option>
                          <option value="MIXED">Mixed</option>
                        </select>
                        <button
                          type="submit"
                          className="text-xs font-bold px-4 py-1.5 rounded-lg transition-colors text-white"
                          style={{ background: "var(--brand)" }}
                        >
                          + Add lesson
                        </button>
                      </form>
                    </div>
                  );
                })}
            </div>

            {/* Add module form */}
            <form action={actionCreateModule.bind(null, id)} className="mt-5 flex gap-2">
              <input
                name="title"
                placeholder="New module title"
                required
                className="flex-1 text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                style={miniInputStyle}
              />
              <button
                type="submit"
                className="text-sm font-bold px-5 py-2 rounded-lg transition-colors text-white"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                + Add module
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Sidebar ─────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-2xl border p-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Sales page</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>Auto-generated from course data.</p>
            <Link
              href={`/course/${course.slug}`}
              target="_blank"
              className="block text-center text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
              style={{ background: "rgba(192,132,252,0.12)", color: "var(--accent)" }}
            >
              Preview sales page ↗
            </Link>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: "var(--bg-surface)", borderColor: "rgba(248,113,113,0.3)" }}>
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--danger)" }}>Danger zone</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>Permanently delete this course and all its data. This cannot be undone.</p>
            <form action={deleteAction}>
              <button
                type="submit"
                className="w-full text-sm font-bold px-4 py-2.5 rounded-lg transition-colors text-white"
                style={{ background: "var(--danger)" }}
                onClick={(e) => { if (!confirm("Delete this course permanently?")) e.preventDefault(); }}
              >
                Delete course
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const [course, instructors] = await Promise.all([getCourse(id), listInstructors()]);
  if (!course) notFound();

  const updateAction = actionUpdateCourse.bind(null, id);
  const deleteAction = actionDeleteCourse.bind(null, id);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/courses" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Courses
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900 truncate">{course.title}</h1>
        <StatusBadge status={course.status} />
        <Link
          href={`/course/${course.slug}`}
          target="_blank"
          className="ml-auto text-xs text-indigo-600 hover:underline"
        >
          View sales page ↗
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Course form ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-7">
            <h2 className="text-base font-bold text-gray-900 mb-5">Course details</h2>
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
                <button type="submit" className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  Save changes
                </button>
              </div>
            </form>
          </div>

          {/* ── Modules & Lessons ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7">
            <h2 className="text-base font-bold text-gray-900 mb-5">Curriculum</h2>

            {course.modules.length === 0 && (
              <p className="text-sm text-gray-400 mb-4">No modules yet. Add your first module below.</p>
            )}

            <div className="space-y-5">
              {course.modules
                .sort((a, b) => a.position - b.position)
                .map((mod) => {
                  const deleteModAction = actionDeleteModule.bind(null, id, mod.id);
                  const createLessonAction = actionCreateLesson.bind(null, id, mod.id);

                  return (
                    <div key={mod.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Module header */}
                      <div className="bg-gray-50 px-5 py-3 flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono">#{mod.position}</span>
                        <span className="font-semibold text-gray-900 text-sm flex-1">{mod.title}</span>
                        <form action={deleteModAction}>
                          <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium" onClick={(e) => { if (!confirm("Delete this module and all its lessons?")) e.preventDefault(); }}>
                            Delete
                          </button>
                        </form>
                      </div>

                      {/* Lessons */}
                      <div className="divide-y divide-gray-100">
                        {mod.lessons
                          .sort((a, b) => a.position - b.position)
                          .map((lesson) => {
                            const deleteLessonAction = actionDeleteLesson.bind(null, id, lesson.id);
                            return (
                              <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                                <span className="text-xs text-gray-400 font-mono w-4">{lesson.position}</span>
                                <span className="text-sm text-gray-700 flex-1">{lesson.title}</span>
                                <StatusBadge status={lesson.status} />
                                <span className="text-xs text-gray-400">{lesson.type}</span>
                                <form action={deleteLessonAction}>
                                  <button type="submit" className="text-xs text-red-400 hover:text-red-600" onClick={(e) => { if (!confirm("Delete this lesson?")) e.preventDefault(); }}>
                                    ×
                                  </button>
                                </form>
                              </div>
                            );
                          })}
                      </div>

                      {/* Add lesson form */}
                      <form action={createLessonAction} className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex gap-2 flex-wrap">
                        <input name="title" placeholder="Lesson title" required className="flex-1 min-w-[140px] text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        <select name="type" className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                          <option value="VIDEO">Video</option>
                          <option value="TEXT">Text</option>
                          <option value="DOWNLOAD">Download</option>
                          <option value="MIXED">Mixed</option>
                        </select>
                        <button type="submit" className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                          + Add lesson
                        </button>
                      </form>
                    </div>
                  );
                })}
            </div>

            {/* Add module form */}
            <form action={actionCreateModule.bind(null, id)} className="mt-5 flex gap-2">
              <input name="title" placeholder="New module title" required className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button type="submit" className="bg-gray-900 text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                + Add module
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Danger zone ────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Sales page</h3>
            <p className="text-xs text-gray-500 mb-4">Auto-generated from course data.</p>
            <Link
              href={`/course/${course.slug}`}
              target="_blank"
              className="block text-center bg-indigo-50 text-indigo-700 text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Preview sales page ↗
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <h3 className="text-sm font-bold text-red-700 mb-1">Danger zone</h3>
            <p className="text-xs text-gray-500 mb-4">Permanently delete this course and all its data. This cannot be undone.</p>
            <form action={deleteAction}>
              <button
                type="submit"
                className="w-full bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
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

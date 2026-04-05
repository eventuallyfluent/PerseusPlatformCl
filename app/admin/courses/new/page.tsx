import type { Metadata } from "next";
import Link from "next/link";
import { listInstructors } from "@/lib/instructors/service";
import { FormField } from "@/components/admin/FormField";
import { actionCreateCourse } from "../actions";

export const metadata: Metadata = { title: "New Course" };

export default async function NewCoursePage() {
  const instructors = await listInstructors();

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/courses" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          ← Courses
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>New course</h1>
      </div>

      <form action={actionCreateCourse} className="rounded-2xl border p-8 space-y-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <FormField label="Title" name="title" required placeholder="e.g. Introduction to Python" />
        <FormField label="Slug" name="slug" placeholder="auto-generated from title if empty" hint="URL-safe identifier. Leave blank to auto-generate." />
        <FormField label="Subtitle" name="subtitle" placeholder="A short one-line description" />
        <FormField label="Description" name="description" rows={4} placeholder="Full course description…" />

        <FormField label="Instructor" name="instructorId" required>
          <option value="">Select an instructor</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </FormField>

        <FormField label="Status" name="status">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </FormField>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="text-sm font-bold px-6 py-2.5 rounded-lg transition-colors text-white"
            style={{ background: "var(--brand)" }}
          >
            Create course
          </button>
          <Link
            href="/admin/courses"
            className="border text-sm font-bold px-6 py-2.5 rounded-lg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

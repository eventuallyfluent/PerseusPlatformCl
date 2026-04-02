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
        <Link href="/admin/courses" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Courses
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">New course</h1>
      </div>

      <form action={actionCreateCourse} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
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
            className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Create course
          </button>
          <Link
            href="/admin/courses"
            className="border border-gray-300 text-gray-700 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

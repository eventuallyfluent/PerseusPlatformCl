import type { Metadata } from "next";
import Link from "next/link";
import { listCourses } from "@/lib/courses/service";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Courses" };
export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await listCourses();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Courses</h1>
        <Link
          href="/admin/courses/new"
          className="text-sm font-bold px-5 py-2.5 rounded-lg transition-colors text-white"
          style={{ background: "var(--brand)" }}
        >
          + New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>No courses yet.</p>
          <Link href="/admin/courses/new" className="mt-3 inline-block text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Create your first course →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead className="border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Title</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Slug</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Modules</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-4 font-medium max-w-xs truncate" style={{ color: "var(--text-primary)" }}>{course.title}</td>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{course.slug}</td>
                  <td className="px-5 py-4"><StatusBadge status={course.status} /></td>
                  <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>
                    {(course as unknown as { _count: { modules: number } })._count?.modules ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/courses/${course.id}`} className="font-medium text-xs hover:underline" style={{ color: "var(--accent)" }}>
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

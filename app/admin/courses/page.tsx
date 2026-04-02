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
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No courses yet.</p>
          <Link href="/admin/courses/new" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
            Create your first course →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Slug</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Modules</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate">
                    {course.title}
                  </td>
                  <td className="px-5 py-4 text-gray-500 font-mono text-xs">{course.slug}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={course.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {(course as unknown as { _count: { modules: number } })._count?.modules ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-indigo-600 hover:underline font-medium text-xs"
                    >
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

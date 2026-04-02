import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

async function getStats() {
  const [courses, orders, enrollments, imports] = await Promise.all([
    db.course.count(),
    db.order.count(),
    db.enrollment.count(),
    db.importBatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, filename: true, status: true, rowCount: true, errorCount: true, createdAt: true },
    }),
  ]);
  return { courses, orders, enrollments, recentImports: imports };
}

export default async function AdminDashboard() {
  const { courses, orders, enrollments, recentImports } = await getStats();

  const stats = [
    { label: "Courses", value: courses, href: "/admin/courses", color: "bg-indigo-500" },
    { label: "Orders", value: orders, href: "/admin/orders", color: "bg-green-500" },
    { label: "Enrollments", value: enrollments, href: "/admin/orders", color: "bg-purple-500" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {stats.map(({ label, value, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
              {value}
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/courses/new" className="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
            + New course
          </Link>
          <Link href="/admin/imports/new" className="bg-white border border-gray-300 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            Import CSV
          </Link>
          <Link href="/admin/redirects" className="bg-white border border-gray-300 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            Manage redirects
          </Link>
        </div>
      </div>

      {/* Recent imports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent imports</h2>
          <Link href="/admin/imports" className="text-sm text-indigo-600 hover:underline">View all →</Link>
        </div>
        {recentImports.length === 0 ? (
          <p className="text-gray-400 text-sm">No imports yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {recentImports.map((imp) => (
              <Link key={imp.id} href={`/admin/imports`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{imp.filename}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {imp.rowCount} rows · {imp.errorCount} errors · {new Date(imp.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  imp.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  imp.status === "FAILED" ? "bg-red-100 text-red-600" :
                  imp.status === "RUNNING" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {imp.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

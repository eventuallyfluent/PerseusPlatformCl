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
    { label: "Courses", value: courses, href: "/admin/courses" },
    { label: "Orders", value: orders, href: "/admin/orders" },
    { label: "Enrollments", value: enrollments, href: "/admin/orders" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border p-6 flex items-center gap-4 transition-colors hover:border-[var(--accent)]"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ background: "var(--brand)" }}
            >
              {value}
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/courses/new"
            className="text-sm font-bold px-5 py-2.5 rounded-lg transition-colors text-white"
            style={{ background: "var(--brand)" }}
          >
            + New course
          </Link>
          <Link
            href="/admin/imports/new"
            className="border text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Import CSV
          </Link>
          <Link
            href="/admin/redirects"
            className="border text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Manage redirects
          </Link>
          <Link
            href="/admin/settings"
            className="border text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Site settings
          </Link>
        </div>
      </div>

      {/* Recent imports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Recent imports</h2>
          <Link href="/admin/imports" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>View all →</Link>
        </div>
        {recentImports.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No imports yet.</p>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
            {recentImports.map((imp) => (
              <Link
                key={imp.id}
                href="/admin/imports"
                className="flex items-center gap-4 px-5 py-4 border-b transition-colors last:border-b-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{imp.filename}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {imp.rowCount} rows · {imp.errorCount} errors · {new Date(imp.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: imp.status === "COMPLETED" ? "rgba(52,211,153,0.12)" :
                                imp.status === "FAILED"    ? "rgba(248,113,113,0.12)" :
                                imp.status === "RUNNING"   ? "rgba(251,191,36,0.15)" :
                                "rgba(167,139,202,0.12)",
                    color: imp.status === "COMPLETED" ? "var(--success)" :
                           imp.status === "FAILED"    ? "var(--danger)" :
                           imp.status === "RUNNING"   ? "var(--warning)" :
                           "var(--text-secondary)",
                  }}
                >
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

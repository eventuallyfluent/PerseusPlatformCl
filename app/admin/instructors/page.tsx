import type { Metadata } from "next";
import Link from "next/link";
import { listInstructors } from "@/lib/instructors/service";

export const metadata: Metadata = { title: "Instructors" };
export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage() {
  const instructors = await listInstructors();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Instructors</h1>
        <Link
          href="/admin/instructors/new"
          className="text-sm font-bold px-5 py-2.5 rounded-lg transition-colors text-white"
          style={{ background: "var(--brand)" }}
        >
          + New instructor
        </Link>
      </div>

      {instructors.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>No instructors yet.</p>
          <Link href="/admin/instructors/new" className="mt-3 inline-block text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Add your first instructor →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead className="border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Name</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-4 font-medium" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center gap-3">
                      {instructor.avatar ? (
                        <img src={instructor.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: "var(--brand)" }}
                        >
                          {instructor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {instructor.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/instructors/${instructor.id}`} className="font-medium text-xs hover:underline" style={{ color: "var(--accent)" }}>
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

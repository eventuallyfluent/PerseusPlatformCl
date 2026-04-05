import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      enrollments: {
        select: {
          course: { select: { title: true } },
        },
      },
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Users</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{users.length} total</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>No users yet.</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Users appear here when they register or purchase a course.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead className="border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>User</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Role</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Enrollments</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: "var(--brand)" }}
                      >
                        {(user.name ?? user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{user.name ?? "—"}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {user.isAdmin ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(123,47,190,0.15)", color: "var(--accent)" }}
                      >
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Student</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {user.enrollments.length === 0 ? (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>None</span>
                    ) : (
                      <div className="space-y-0.5">
                        {user.enrollments.map((e, i) => (
                          <p key={i} className="text-xs" style={{ color: "var(--text-primary)" }}>{e.course.title}</p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
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

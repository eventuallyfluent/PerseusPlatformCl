import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Imports" };
export const dynamic = "force-dynamic";

export default async function AdminImportsPage() {
  const batches = await db.importBatch.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Imports</h1>
        <Link
          href="/admin/imports/new"
          className="text-sm font-bold px-5 py-2.5 rounded-lg transition-colors text-white"
          style={{ background: "var(--brand)" }}
        >
          + Import CSV
        </Link>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>No imports yet.</p>
          <Link href="/admin/imports/new" className="mt-3 inline-block text-sm hover:underline" style={{ color: "var(--accent)" }}>
            Upload your first CSV →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead className="border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>File</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Rows</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Errors</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Dry run</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-4 font-medium max-w-xs truncate" style={{ color: "var(--text-primary)" }}>{batch.filename}</td>
                  <td className="px-5 py-4"><StatusBadge status={batch.status} /></td>
                  <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{batch.rowCount}</td>
                  <td className="px-5 py-4">
                    {batch.errorCount > 0 ? (
                      <span className="font-medium" style={{ color: "var(--danger)" }}>{batch.errorCount}</span>
                    ) : (
                      <span style={{ color: "var(--text-secondary)" }}>{batch.errorCount}</span>
                    )}
                  </td>
                  <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{batch.dryRun ? "Yes" : "No"}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {new Date(batch.createdAt).toLocaleString()}
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

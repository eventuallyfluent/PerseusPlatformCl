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
        <h1 className="text-2xl font-bold text-gray-900">Imports</h1>
        <Link
          href="/admin/imports/new"
          className="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Import CSV
        </Link>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No imports yet.</p>
          <Link href="/admin/imports/new" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
            Upload your first CSV →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">File</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Rows</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Errors</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Dry run</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate">{batch.filename}</td>
                  <td className="px-5 py-4"><StatusBadge status={batch.status} /></td>
                  <td className="px-5 py-4 text-gray-500">{batch.rowCount}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {batch.errorCount > 0 ? (
                      <span className="text-red-600 font-medium">{batch.errorCount}</span>
                    ) : batch.errorCount}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{batch.dryRun ? "Yes" : "No"}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
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

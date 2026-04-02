"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ImportSummary = {
  dryRun: boolean;
  coursesCreated: number;
  coursesUpdated: number;
  modulesCreated: number;
  modulesUpdated: number;
  lessonsCreated: number;
  lessonsUpdated: number;
  offersCreated: number;
  redirectsCreated: number;
  errors: Array<{ row: number; field: string; message: string }>;
};

export default function NewImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: ImportSummary } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dryRun", String(dryRun));

    try {
      const res = await fetch("/api/imports", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Import failed (${res.status})`);
      }

      setResult({ summary: data.summary as ImportSummary });

      if (!dryRun) {
        // Real import completed — redirect to list after a moment
        setTimeout(() => router.push("/admin/imports"), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/imports" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Imports
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Import CSV</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        {/* File picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            CSV file <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && (
            <p className="text-xs text-gray-400">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Dry-run toggle */}
        <div className="flex items-start gap-3">
          <input
            id="dryRun"
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <label htmlFor="dryRun" className="text-sm font-medium text-gray-700 cursor-pointer">
              Dry run (preview only)
            </label>
            <p className="text-xs text-gray-400 mt-0.5">
              Validates and shows what would be imported without writing to the database.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing…" : dryRun ? "Preview import" : "Run import"}
        </button>
      </form>

      {/* Result panel */}
      {result && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-7">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-base font-bold text-gray-900">
              {result.summary.dryRun ? "Dry-run preview" : "Import complete"}
            </h2>
            {result.summary.dryRun && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                Preview only — nothing was written
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              ["Courses", `+${result.summary.coursesCreated} / ~${result.summary.coursesUpdated}`],
              ["Modules", `+${result.summary.modulesCreated} / ~${result.summary.modulesUpdated}`],
              ["Lessons", `+${result.summary.lessonsCreated} / ~${result.summary.lessonsUpdated}`],
              ["Offers", `+${result.summary.offersCreated}`],
            ].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-900">{val}</p>
              </div>
            ))}
          </div>

          {result.summary.errors.length > 0 ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm font-bold text-red-700 mb-3">
                {result.summary.errors.length} validation error{result.summary.errors.length !== 1 ? "s" : ""}
              </p>
              <ul className="space-y-1.5">
                {result.summary.errors.slice(0, 20).map((e, i) => (
                  <li key={i} className="text-xs text-red-600">
                    Row {e.row} [{e.field}]: {e.message}
                  </li>
                ))}
                {result.summary.errors.length > 20 && (
                  <li className="text-xs text-red-400">… and {result.summary.errors.length - 20} more</li>
                )}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No errors — {result.summary.dryRun ? "safe to run for real." : "import succeeded!"}
            </div>
          )}

          {result.summary.dryRun && result.summary.errors.length === 0 && (
            <button
              className="mt-4 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              onClick={() => { setDryRun(false); setResult(null); }}
            >
              Run real import →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

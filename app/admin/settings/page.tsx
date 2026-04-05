"use client";

import { useState, useEffect } from "react";

const FIELDS: { key: string; label: string; rows?: number; section: string }[] = [
  // Site identity
  { section: "Site Identity", key: "site.name",    label: "Site name" },
  { section: "Site Identity", key: "site.tagline", label: "Tagline" },
  // Hero
  { section: "Homepage Hero", key: "hero.headline",      label: "Headline", rows: 2 },
  { section: "Homepage Hero", key: "hero.subtext",       label: "Subtext", rows: 3 },
  { section: "Homepage Hero", key: "hero.cta_primary",   label: "Primary CTA button" },
  { section: "Homepage Hero", key: "hero.cta_secondary", label: "Secondary CTA button" },
  // Trust bar
  { section: "Trust Bar", key: "trust.item1.title", label: "Item 1 title" },
  { section: "Trust Bar", key: "trust.item1.sub",   label: "Item 1 subtitle" },
  { section: "Trust Bar", key: "trust.item2.title", label: "Item 2 title" },
  { section: "Trust Bar", key: "trust.item2.sub",   label: "Item 2 subtitle" },
  { section: "Trust Bar", key: "trust.item3.title", label: "Item 3 title" },
  { section: "Trust Bar", key: "trust.item3.sub",   label: "Item 3 subtitle" },
  // Bottom CTA
  { section: "Bottom CTA", key: "cta.headline", label: "Headline" },
  { section: "Botto CTA",  key: "cta.subtext",  label: "Subtext", rows: 2 },
  { section: "Bottom CTA", key: "cta.button",   label: "Button text" },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/get")
      .then((r) => r.json())
      .then((data: Record<string, string>) => { setValues(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const sections = Array.from(new Set(FIELDS.map((f) => f.section)));

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400 text-sm">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Edit public-facing copy without a code deploy.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {section}
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
              {FIELDS.filter((f) => f.section === section).map((field) => (
                <div key={field.key} className="px-5 py-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                  </label>
                  {field.rows ? (
                    <textarea
                      rows={field.rows}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-1 font-mono">{field.key}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

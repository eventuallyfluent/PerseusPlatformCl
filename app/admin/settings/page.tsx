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
  { section: "Bottom CTA", key: "cta.subtext",  label: "Subtext", rows: 2 },
  { section: "Bottom CTA", key: "cta.button",   label: "Button text" },
];

const inputStyle = {
  background: "var(--bg-elevated)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
} as React.CSSProperties;

const inputCls = "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y";

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
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Site Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Edit public-facing copy without a code deploy.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style={{ background: "var(--brand)" }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      {error && (
        <p
          className="text-sm rounded-lg px-4 py-3 mb-6 border"
          style={{ color: "var(--danger)", background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.3)" }}
        >
          {error}
        </p>
      )}

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section}>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
              {section}
            </h2>
            <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
              {FIELDS.filter((f) => f.section === section).map((field, idx, arr) => (
                <div
                  key={field.key}
                  className="px-5 py-4"
                  style={idx < arr.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}
                >
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                    {field.label}
                  </label>
                  {field.rows ? (
                    <textarea
                      rows={field.rows}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}
                    />
                  )}
                  <p className="text-xs font-mono mt-1" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>{field.key}</p>
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
          className="text-sm font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style={{ background: "var(--brand)" }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

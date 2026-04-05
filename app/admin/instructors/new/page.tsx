import type { Metadata } from "next";
import Link from "next/link";
import { FormField } from "@/components/admin/FormField";
import { actionCreateInstructor } from "../actions";

export const metadata: Metadata = { title: "New Instructor" };

export default function NewInstructorPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/instructors" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          ← Instructors
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>New instructor</h1>
      </div>

      <form action={actionCreateInstructor} className="rounded-2xl border p-8 space-y-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <FormField label="Full name" name="name" required placeholder="e.g. Dr. Elena Voss" />
        <FormField label="Bio" name="bio" rows={4} placeholder="A short biography shown on the course sales page…" />
        <FormField label="Avatar URL" name="avatar" placeholder="https://…" hint="Square image, ideally 200×200px" />

        <div className="border-t pt-6" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>Social links (optional)</p>
          <div className="space-y-4">
            <FormField label="Twitter / X URL" name="twitter" placeholder="https://twitter.com/…" />
            <FormField label="LinkedIn URL" name="linkedin" placeholder="https://linkedin.com/in/…" />
            <FormField label="Website URL" name="website" placeholder="https://…" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="text-sm font-bold px-6 py-2.5 rounded-lg transition-colors text-white"
            style={{ background: "var(--brand)" }}
          >
            Create instructor
          </button>
          <Link
            href="/admin/instructors"
            className="border text-sm font-bold px-6 py-2.5 rounded-lg transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

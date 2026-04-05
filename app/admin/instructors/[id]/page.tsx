import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getInstructor } from "@/lib/instructors/service";
import { FormField } from "@/components/admin/FormField";
import { actionUpdateInstructor, actionDeleteInstructor } from "../actions";

export const metadata: Metadata = { title: "Edit Instructor" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditInstructorPage({ params }: Props) {
  const { id } = await params;
  const instructor = await getInstructor(id);
  if (!instructor) notFound();

  const updateAction = actionUpdateInstructor.bind(null, id);
  const deleteAction = actionDeleteInstructor.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/instructors" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          ← Instructors
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 className="text-2xl font-bold truncate" style={{ color: "var(--text-primary)" }}>{instructor.name}</h1>
      </div>

      <div className="space-y-6">
        <form action={updateAction} className="rounded-2xl border p-8 space-y-6" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <FormField label="Full name" name="name" required defaultValue={instructor.name} />
          <FormField label="Bio" name="bio" rows={4} defaultValue={instructor.bio ?? ""} />
          <FormField label="Avatar URL" name="avatar" defaultValue={instructor.avatar ?? ""} placeholder="https://…" hint="Square image, ideally 200×200px" />

          <div className="border-t pt-6" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>Social links</p>
            <div className="space-y-4">
              <FormField label="Twitter / X URL" name="twitter" defaultValue={instructor.twitter ?? ""} placeholder="https://twitter.com/…" />
              <FormField label="LinkedIn URL" name="linkedin" defaultValue={instructor.linkedin ?? ""} placeholder="https://linkedin.com/in/…" />
              <FormField label="Website URL" name="website" defaultValue={instructor.website ?? ""} placeholder="https://…" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="text-sm font-bold px-6 py-2.5 rounded-lg transition-colors text-white"
              style={{ background: "var(--brand)" }}
            >
              Save changes
            </button>
          </div>
        </form>

        <div className="rounded-2xl border p-6" style={{ background: "var(--bg-surface)", borderColor: "rgba(248,113,113,0.3)" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "var(--danger)" }}>Danger zone</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
            Delete this instructor. Courses assigned to them must be reassigned first.
          </p>
          <form action={deleteAction}>
            <button
              type="submit"
              className="text-sm font-bold px-4 py-2.5 rounded-lg transition-colors text-white"
              style={{ background: "var(--danger)" }}
              onClick={(e) => { if (!confirm("Delete this instructor permanently?")) e.preventDefault(); }}
            >
              Delete instructor
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

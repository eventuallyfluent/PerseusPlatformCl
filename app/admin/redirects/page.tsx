import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { listRedirects, createRedirect, deleteRedirect } from "@/lib/urls/service";
import { FormField } from "@/components/admin/FormField";

export const metadata: Metadata = { title: "Redirects" };
export const dynamic = "force-dynamic";

async function actionCreateRedirect(formData: FormData) {
  "use server";
  await createRedirect(
    String(formData.get("fromPath") ?? ""),
    String(formData.get("toPath") ?? ""),
    formData.get("isPermanent") === "true",
  );
  revalidatePath("/admin/redirects");
}

async function actionDeleteRedirect(id: string) {
  "use server";
  await deleteRedirect(id);
  revalidatePath("/admin/redirects");
}

const selectStyle = {
  background: "var(--bg-elevated)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
} as React.CSSProperties;

export default async function AdminRedirectsPage() {
  const redirects = await listRedirects();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Redirects</h1>

      {/* Create form */}
      <div className="rounded-2xl border p-7 mb-8" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <h2 className="text-base font-bold mb-5" style={{ color: "var(--text-primary)" }}>Add redirect</h2>
        <form action={actionCreateRedirect} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="From path" name="fromPath" required placeholder="/old-url" hint="Must start with /" />
          <FormField label="To path" name="toPath" required placeholder="/new-url" hint="Can be a relative path or full URL" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Type</label>
            <select
              name="isPermanent"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={selectStyle}
            >
              <option value="true">301 Permanent</option>
              <option value="false">302 Temporary</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="text-sm font-bold px-5 py-2.5 rounded-lg transition-colors text-white"
              style={{ background: "var(--brand)" }}
            >
              Add redirect
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {redirects.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No redirects configured.</p>
      ) : (
        <div className="rounded-2xl border overflow-x-auto" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead className="border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>From</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>To</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Type</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => {
                const deleteAction = actionDeleteRedirect.bind(null, r.id);
                return (
                  <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-primary)" }}>{r.fromPath}</td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-primary)" }}>{r.toPath}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{r.isPermanent ? "301" : "302"}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteAction} className="inline">
                        <button type="submit" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--danger)" }}>
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

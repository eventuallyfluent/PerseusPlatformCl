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

export default async function AdminRedirectsPage() {
  const redirects = await listRedirects();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Redirects</h1>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-7 mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-5">Add redirect</h2>
        <form action={actionCreateRedirect} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="From path" name="fromPath" required placeholder="/old-url" hint="Must start with /" />
          <FormField label="To path" name="toPath" required placeholder="/new-url" hint="Can be a relative path or full URL" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select name="isPermanent" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="true">301 Permanent</option>
              <option value="false">302 Temporary</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
              Add redirect
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {redirects.length === 0 ? (
        <p className="text-gray-400 text-sm">No redirects configured.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">From</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">To</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redirects.map((r) => {
                const deleteAction = actionDeleteRedirect.bind(null, r.id);
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{r.fromPath}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{r.toPath}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{r.isPermanent ? "301" : "302"}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteAction} className="inline">
                        <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium">
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

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      offer: {
        include: { course: { select: { title: true, slug: true } } },
      },
    },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>No orders yet.</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Orders will appear here when students enroll.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-x-auto" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead className="border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Order ID</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Course</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Amount</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t transition-colors" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{order.id.slice(0, 12)}…</td>
                  <td className="px-5 py-4 font-medium max-w-[200px] truncate" style={{ color: "var(--text-primary)" }}>
                    {order.offer.course.title}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-4" style={{ color: "var(--text-primary)" }}>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: order.currency,
                    }).format(Number(order.totalAmount))}
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {new Date(order.createdAt).toLocaleString()}
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

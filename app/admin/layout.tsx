import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Perseus Admin" },
};

/**
 * Admin layout — completely separate from the public layout.
 * No Navbar, no Footer. Dark sidebar + content area.
 *
 * Next.js App Router: this layout replaces the root layout's <main>
 * wrapper for all /admin/* routes. The root layout's <body> and
 * global CSS still apply, but the Navbar/Footer are NOT rendered
 * because this layout is returned as children of the root layout's
 * <main> — which is flex-1. We therefore force our own flex row here.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/courses", label: "Courses", icon: "🎓" },
  { href: "/admin/instructors", label: "Instructors", icon: "👤" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/orders", label: "Orders", icon: "💳" },
  { href: "/admin/imports", label: "Imports", icon: "📥" },
  { href: "/admin/redirects", label: "Redirects", icon: "↩" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 min-h-screen flex flex-col flex-shrink-0 border-r"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="font-display text-base" style={{ color: "var(--text-primary)" }}>
          Perseus
        </Link>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {NAV.map(({ href, label, icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors"
              style={{
                background: active ? "var(--brand)" : undefined,
                color: active ? "#fff" : "var(--text-secondary)",
                fontWeight: active ? 600 : 400,
              }}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-xs transition-colors hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}

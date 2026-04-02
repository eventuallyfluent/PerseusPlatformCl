"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/courses", label: "Courses", icon: "🎓" },
  { href: "/admin/imports", label: "Imports", icon: "📥" },
  { href: "/admin/orders", label: "Orders", icon: "💳" },
  { href: "/admin/redirects", label: "Redirects", icon: "↩" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-gray-950 text-gray-300 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Perseus
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">Admin</p>
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
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white font-medium"
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-5 py-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}

import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  // Derive avatar initials from name or email
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const displayName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Account";

  const isLoggedIn = !!user;

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isLoggedIn
          ? "border-[var(--brand)] bg-[var(--bg-base)]/90"
          : "border-[var(--border)] bg-[var(--bg-base)]/80"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo — only place Cinzel Decorative appears in nav */}
        <Link
          href="/"
          className="font-display text-lg text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors tracking-wide shrink-0"
        >
          Perseus
        </Link>

        {/* Centre nav links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
          <Link href="/courses" className="hover:text-[var(--text-primary)] transition-colors">
            Courses
          </Link>
          {isLoggedIn && (
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
              My Learning
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            /* Logged-in: avatar + name */
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </span>
              <span className="hidden sm:block">{displayName}</span>
              {/* Chevron */}
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          ) : (
            /* Logged-out: ghost Login + filled Browse Courses */
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)] px-4 py-1.5 rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/courses"
                className="text-sm font-bold text-white bg-[var(--brand)] px-4 py-1.5 rounded-full hover:bg-[var(--brand-hover)] transition-colors"
              >
                Browse Courses
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

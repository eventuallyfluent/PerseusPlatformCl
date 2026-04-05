import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--bg-base)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="font-display text-base text-[var(--text-primary)] mb-2">Perseus</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Learn from the best. Build something great.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Platform</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/courses" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                All Courses
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                My Learning
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Legal</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] text-center py-4 text-xs text-[var(--text-secondary)]">
        © {new Date().getFullYear()} Perseus Platform. All rights reserved.
      </div>
    </footer>
  );
}

import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-indigo-600 tracking-tight hover:text-indigo-700 transition-colors"
        >
          Perseus
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/courses" className="hover:text-indigo-600 transition-colors">
            Courses
          </Link>
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            My Learning
          </Link>
        </nav>
      </div>
    </header>
  );
}

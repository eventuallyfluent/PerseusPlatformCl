import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-bold text-lg mb-2">Perseus</p>
          <p className="text-sm leading-relaxed">
            Learn from the best. Build something great.
          </p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Platform</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/courses" className="hover:text-white transition-colors">
                All Courses
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                My Learning
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Legal</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} Perseus Platform. All rights reserved.
      </div>
    </footer>
  );
}

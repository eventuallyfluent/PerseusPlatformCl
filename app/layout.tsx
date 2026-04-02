import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Perseus Platform",
    template: "%s | Perseus",
  },
  description: "Learn from expert instructors. Build real skills.",
};

/**
 * Root layout — minimal shell.
 * Navbar + Footer live in app/(public)/layout.tsx.
 * Admin has its own layout at app/admin/layout.tsx.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}

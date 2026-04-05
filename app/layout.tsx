import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Perseus Arcane Academy",
    template: "%s | Perseus",
  },
  description: "Learn from expert instructors. Build real skills.",
};

/**
 * Root layout — minimal shell.
 * Navbar + Footer live in app/(public)/layout.tsx.
 * Admin has its own layout at app/admin/layout.tsx.
 * Google Fonts loaded here via <link> tags (not CSS @import, which blocks Tailwind compilation).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}

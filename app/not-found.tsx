import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--bg-base)" }}
    >
      <p
        className="font-mono text-7xl font-bold mb-4 opacity-20"
        style={{ color: "var(--accent)" }}
      >
        404
      </p>
      <h1 className="font-display text-2xl sm:text-3xl mb-3" style={{ color: "var(--text-primary)" }}>
        Page not found
      </h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--text-secondary)" }}>
        The path you followed doesn&apos;t exist. It may have moved or been removed.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="font-bold px-6 py-2.5 rounded-full text-sm text-white transition-colors"
          style={{ background: "var(--brand)" }}
        >
          Go home
        </Link>
        <Link
          href="/courses"
          className="font-bold px-6 py-2.5 rounded-full text-sm border transition-colors"
          style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
        >
          Browse courses
        </Link>
      </div>
    </div>
  );
}

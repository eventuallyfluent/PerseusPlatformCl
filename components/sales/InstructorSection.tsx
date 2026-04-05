import Image from "next/image";
import type { SalesPageInstructor } from "@/types";

export function InstructorSection({ instructor }: { instructor: SalesPageInstructor }) {
  return (
    <section className="border-b" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
          Your instructor
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {instructor.avatar ? (
              <Image
                src={instructor.avatar}
                alt={instructor.name}
                width={96}
                height={96}
                className="rounded-full object-cover w-24 h-24"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                style={{ background: "var(--brand)" }}
              >
                {instructor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {instructor.name}
            </h3>
            <div className="flex gap-4 mb-3">
              {instructor.website && (
                <a
                  href={instructor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Website ↗
                </a>
              )}
              {instructor.twitter && (
                <a
                  href={`https://twitter.com/${instructor.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Twitter ↗
                </a>
              )}
              {instructor.linkedin && (
                <a
                  href={instructor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  LinkedIn ↗
                </a>
              )}
            </div>
            {instructor.bio && (
              <p className="leading-relaxed text-sm" style={{ color: "var(--text-secondary)" }}>
                {instructor.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

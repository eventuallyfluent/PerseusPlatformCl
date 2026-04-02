import Image from "next/image";
import type { SalesPageInstructor } from "@/types";

export function InstructorSection({ instructor }: { instructor: SalesPageInstructor }) {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
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
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {instructor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{instructor.name}</h3>
            <div className="flex gap-4 mb-3">
              {instructor.website && (
                <a
                  href={instructor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Website ↗
                </a>
              )}
              {instructor.twitter && (
                <a
                  href={`https://twitter.com/${instructor.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Twitter ↗
                </a>
              )}
              {instructor.linkedin && (
                <a
                  href={instructor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  LinkedIn ↗
                </a>
              )}
            </div>
            {instructor.bio && (
              <p className="text-gray-600 leading-relaxed text-sm">{instructor.bio}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

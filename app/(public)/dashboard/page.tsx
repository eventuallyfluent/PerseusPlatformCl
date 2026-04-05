import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "My Learning" };

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                orderBy: { position: "asc" },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Continue Your Journey
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div
          className="text-center py-20 border border-dashed rounded-2xl"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
            No courses yet
          </p>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>
            Browse our catalog and enroll in your first course.
          </p>
          <Link
            href="/courses"
            className="inline-block font-bold px-6 py-3 rounded-xl transition-colors text-white"
            style={{ background: "var(--brand)" }}
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(({ course, enrolledAt }) => {
            const firstLesson = course.modules.at(0)?.lessons.at(0);
            const continueUrl = firstLesson
              ? `/learn/${course.slug}/${firstLesson.id}`
              : `/learn/${course.slug}`;

            return (
              <div
                key={course.id}
                className="rounded-2xl overflow-hidden border transition-all hover:border-[var(--accent)]"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative" style={{ background: "var(--bg-elevated)" }}>
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12"
                        style={{ color: "var(--border)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h2 className="font-semibold leading-snug line-clamp-2 mb-1" style={{ color: "var(--text-primary)" }}>
                    {course.title}
                  </h2>
                  <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                    Enrolled{" "}
                    {new Date(enrolledAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <Link
                    href={continueUrl}
                    className="block text-center text-sm font-bold py-2.5 rounded-xl transition-colors text-white"
                    style={{ background: "var(--brand)" }}
                  >
                    Continue learning
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

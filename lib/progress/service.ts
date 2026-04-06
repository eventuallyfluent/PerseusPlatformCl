/**
 * Lesson progress tracking service.
 *
 * SCP-equivalent logic:
 * - Marks individual lessons complete (like SCP's lesson completion events)
 * - Computes per-course progress % for dashboard and sidebar
 * - Enforces drip content: a lesson is "unlocked" when
 *     now >= enrollment.enrolledAt + lesson.drip_days days
 */
import { db } from "@/lib/db";

/** Mark a lesson as complete for a user. Idempotent. */
export async function markLessonComplete(userId: string, lessonId: string): Promise<void> {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true, module: { select: { courseId: true } } },
  });
  if (!lesson) return;

  await db.lessonCompletion.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, courseId: lesson.module.courseId },
    update: { completedAt: new Date() },
  });
}

/** Get IDs of all completed lessons for a user within a course. */
export async function getCompletedLessonIds(userId: string, courseId: string): Promise<Set<string>> {
  const completions = await db.lessonCompletion.findMany({
    where: { userId, courseId },
    select: { lessonId: true },
  });
  return new Set(completions.map((c) => c.lessonId));
}

/** Returns { completed, total, percent } for a user in a course. */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<{ completed: number; total: number; percent: number }> {
  const [completed, total] = await Promise.all([
    db.lessonCompletion.count({ where: { userId, courseId } }),
    db.lesson.count({
      where: {
        module: { courseId },
        status: "PUBLISHED",
      },
    }),
  ]);
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/**
 * Check if a lesson is accessible for a given enrollment.
 * Rules (SCP drip logic):
 *  - isPreview lessons → always accessible
 *  - drip_days null / 0 → accessible immediately on enrollment
 *  - drip_days > 0 → accessible after enrolledAt + drip_days
 */
export function isLessonUnlocked(
  lesson: { isPreview: boolean; drip_days: number | null },
  enrollment: { enrolledAt: Date } | null
): boolean {
  if (lesson.isPreview) return true;
  if (!enrollment) return false;
  if (!lesson.drip_days || lesson.drip_days <= 0) return true;

  const unlockDate = new Date(enrollment.enrolledAt);
  unlockDate.setDate(unlockDate.getDate() + lesson.drip_days);
  return new Date() >= unlockDate;
}

/** Returns days until a drip-locked lesson unlocks (0 if already unlocked). */
export function daysUntilUnlock(
  lesson: { drip_days: number | null },
  enrollment: { enrolledAt: Date }
): number {
  if (!lesson.drip_days || lesson.drip_days <= 0) return 0;
  const unlockDate = new Date(enrollment.enrolledAt);
  unlockDate.setDate(unlockDate.getDate() + lesson.drip_days);
  const msLeft = unlockDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

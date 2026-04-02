import { db } from "@/lib/db";
import type { UpdateRedirectInput } from "@/lib/zod/redirect";

// ─── Reserved paths that must never be used as redirect sources ───────────────
const RESERVED_PREFIXES = [
  "/api",
  "/_next",
  "/admin",
  "/dashboard",
  "/checkout",
  "/learn",
  "/b/",
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the canonical public URL for a course.
 * Pure function — no DB call.
 */
export function getCourseUrl(slug: string): string {
  return `/course/${slug}`;
}

// ─── Slug ─────────────────────────────────────────────────────────────────────

/**
 * Checks whether a slug is available for use.
 * Pass excludeCourseId to allow the current course to keep its own slug.
 */
export async function checkSlugAvailable(
  slug: string,
  excludeCourseId?: string
): Promise<{ available: boolean; conflictId?: string }> {
  const course = await db.course.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!course) return { available: true };
  if (excludeCourseId && course.id === excludeCourseId) return { available: true };
  return { available: false, conflictId: course.id };
}

// ─── Conflict detection ───────────────────────────────────────────────────────

/**
 * Detects whether a path conflicts with reserved routes or existing redirects.
 * Returns null if safe, or a descriptive error string if conflicted.
 */
export async function detectConflict(fromPath: string): Promise<string | null> {
  for (const prefix of RESERVED_PREFIXES) {
    if (fromPath.startsWith(prefix)) {
      return `Path "${fromPath}" conflicts with reserved system route "${prefix}"`;
    }
  }

  const existing = await db.redirect.findUnique({
    where: { fromPath },
    select: { toPath: true },
  });

  if (existing) {
    return `Path "${fromPath}" already has a redirect to "${existing.toPath}"`;
  }

  return null;
}

// ─── Legacy URL resolution ────────────────────────────────────────────────────

/**
 * Resolves a Payhip-style legacy ID (e.g. "OWFpo") to a course slug.
 * Used by the /b/[legacyId] route handler.
 */
export async function resolveLegacyId(
  legacyId: string
): Promise<{ slug: string; courseId: string } | null> {
  const course = await db.course.findUnique({
    where: { legacy_id: legacyId },
    select: { id: true, slug: true },
  });

  if (!course) return null;
  return { slug: course.slug, courseId: course.id };
}

/**
 * Resolves an arbitrary legacy URL path to a course slug.
 * Used by the middleware resolve endpoint.
 */
export async function resolveLegacyUrl(
  path: string
): Promise<{ slug: string; courseId: string } | null> {
  const course = await db.course.findUnique({
    where: { legacy_url: path },
    select: { id: true, slug: true },
  });

  if (!course) return null;
  return { slug: course.slug, courseId: course.id };
}

// ─── Redirect table ───────────────────────────────────────────────────────────

/**
 * Looks up a Redirect by fromPath.
 * Used by the middleware resolve endpoint.
 */
export async function resolveRedirect(
  path: string
): Promise<{ toPath: string; isPermanent: boolean } | null> {
  const redirect = await db.redirect.findUnique({
    where: { fromPath: path },
    select: { toPath: true, isPermanent: true },
  });

  return redirect ?? null;
}

/**
 * Lists all redirects ordered by creation date (newest first).
 */
export async function listRedirects() {
  return db.redirect.findMany({ orderBy: { createdAt: "desc" } });
}

/**
 * Creates a new redirect after checking for conflicts.
 * Throws a descriptive error if the fromPath is reserved or already registered.
 */
export async function createRedirect(
  fromPath: string,
  toPath: string,
  isPermanent = true
) {
  if (fromPath === toPath) {
    throw new Error("fromPath and toPath cannot be the same");
  }

  const conflict = await detectConflict(fromPath);
  if (conflict) throw new Error(conflict);

  return db.redirect.create({ data: { fromPath, toPath, isPermanent } });
}

/**
 * Updates a redirect's toPath and/or isPermanent flag.
 */
export async function updateRedirect(id: string, data: UpdateRedirectInput) {
  return db.redirect.update({
    where: { id },
    data: {
      ...(data.toPath !== undefined && { toPath: data.toPath }),
      ...(data.isPermanent !== undefined && { isPermanent: data.isPermanent }),
    },
  });
}

/**
 * Deletes a redirect by ID.
 */
export async function deleteRedirect(id: string) {
  return db.redirect.delete({ where: { id } });
}

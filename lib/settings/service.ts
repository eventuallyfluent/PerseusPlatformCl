import { db } from "@/lib/db";

/**
 * Default values for all site settings.
 * These are used when no DB row exists for a key.
 */
export const SETTING_DEFAULTS: Record<string, string> = {
  "site.name":           "Perseus Arcane Academy",
  "site.tagline":        "Learn skills that actually matter.",
  "hero.headline":       "Learn skills that\nactually matter.",
  "hero.subtext":        "Expert-led courses designed to take you from beginner to confident. Work at your own pace. Learn for life.",
  "hero.cta_primary":   "Browse all courses",
  "hero.cta_secondary": "My learning →",
  "trust.item1.title":  "Expert instructors",
  "trust.item1.sub":    "Real practitioners, not just teachers",
  "trust.item2.title":  "Self-paced learning",
  "trust.item2.sub":    "Go at your own speed, forever",
  "trust.item3.title":  "Lifetime access",
  "trust.item3.sub":    "Buy once, keep forever",
  "cta.headline":       "Ready to start learning?",
  "cta.subtext":        "Join thousands of students already building real skills.",
  "cta.button":         "Browse courses",
};

/**
 * Fetch all settings as a key→value map, merging DB values over defaults.
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.siteSetting.findMany();
  const merged = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    merged[row.key] = row.value;
  }
  return merged;
}

/**
 * Get a single setting value. Returns the default if not set.
 */
export async function getSetting(key: string): Promise<string> {
  const row = await db.siteSetting.findUnique({ where: { key } });
  return row?.value ?? SETTING_DEFAULTS[key] ?? "";
}

/**
 * Upsert a batch of settings (key → value pairs).
 */
export async function saveSettings(data: Record<string, string>): Promise<void> {
  await db.$transaction(
    Object.entries(data).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );
}

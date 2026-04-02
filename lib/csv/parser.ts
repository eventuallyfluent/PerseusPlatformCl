import Papa from "papaparse";

export type RawCSVRow = Record<string, string>;

export type ParseResult = {
  data: RawCSVRow[];
  errors: string[];
};

/**
 * Parses a CSV Buffer into an array of raw string-keyed objects.
 * Uses papaparse with header mode — first row becomes the column keys.
 */
export function parseCSV(buffer: Buffer): ParseResult {
  const csv = buffer.toString("utf-8");

  const result = Papa.parse<RawCSVRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  const errors: string[] = result.errors.map(
    (e) => `Row ${(e.row ?? 0) + 2}: ${e.message}` // +2 for 1-based + header row
  );

  return {
    data: result.data,
    errors,
  };
}

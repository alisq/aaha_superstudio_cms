/**
 * Convert a string into a URL-safe slug
 * - lowercases
 * - removes diacritics
 * - replaces spaces & punctuation with hyphens
 * - collapses multiple hyphens
 */
export function slugify(input = "") {
  return input
    .toString()
    .normalize("NFKD")                 // split accented characters
    .replace(/[\u0300-\u036f]/g, "")   // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")              // remove quotes
    .replace(/[^a-z0-9]+/g, "_")       // non-alphanumeric → underscore
    .replace(/^-+|-+$/g, "");          // trim leading/trailing hyphens
}

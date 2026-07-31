export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return input.replace(/<[^>]*>?/gm, "");
}

export function sanitizeString(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "");
}

export function sanitizeSlug(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

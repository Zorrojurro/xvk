import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fix common mojibake sequences that appear when UTF-8 text is mis-decoded.
 * Keep replacements ASCII-safe to avoid reintroducing encoding issues.
 */
export function cleanText(input: string) {
  return String(input ?? "")
    // smart apostrophes / quotes (mojibake)
    .replaceAll("\u00e2\u20ac\u2122", "'") // â€™
    .replaceAll("\u00e2\u20ac\u02dc", "'") // â€˜
    .replaceAll("\u00e2\u20ac\u0153", '"') // â€œ
    .replaceAll("\u00e2\u20ac\u009d", '"') // â€

    // en-dash / em-dash mojibake -> ASCII dash
    .replaceAll("\u00e2\u20ac\u201c", "-") // â€“
    .replaceAll("\u00e2\u20ac\u201d", "-") // â€”
    .replaceAll("\u00e2\u20ac\u00a2", "-") // â€¢

    // stray UTF-8 artifacts
    .replaceAll("\u00c2", "") // Â
    .replaceAll("\u00a0", " ") // NBSP

    // collapse weird spacing
    .replace(/\s+/g, " ")
    .trim()
}

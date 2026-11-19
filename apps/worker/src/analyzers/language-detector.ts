import type { LanguageBreakdown } from "@yashuverse/contracts";

export function analyzeLanguages(rawLanguages: Record<string, number>): LanguageBreakdown {
  const entries = Object.entries(rawLanguages);
  const totalBytes = entries.reduce((acc, [, bytes]) => acc + bytes, 0);

  if (totalBytes === 0) {
    return {
      languages: {},
      primaryLanguage: "Unknown",
      totalBytes: 0,
    };
  }

  const breakdown: Record<string, { bytes: number; percentage: number }> = {};
  let primaryLanguage = entries[0]?.[0] || "Unknown";
  let maxBytes = -1;

  for (const [lang, bytes] of entries) {
    const percentage = Number(((bytes / totalBytes) * 100).toFixed(1));
    breakdown[lang] = {
      bytes,
      percentage,
    };

    if (bytes > maxBytes) {
      maxBytes = bytes;
      primaryLanguage = lang;
    }
  }

  return {
    languages: breakdown,
    primaryLanguage,
    totalBytes,
  };
}

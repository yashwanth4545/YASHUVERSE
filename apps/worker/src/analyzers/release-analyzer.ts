import type { ReleaseArtifact } from "@yashuverse/contracts";

export function analyzeReleases(rawReleases: any[]): ReleaseArtifact[] {
  if (!Array.isArray(rawReleases)) return [];

  return rawReleases.slice(0, 10).map((r) => ({
    tagName: r.tag_name || "v0.0.0",
    name: r.name || null,
    description: r.body || null,
    publishedAt: r.published_at || r.created_at || new Date().toISOString(),
    htmlUrl: r.html_url || "",
    author: r.author?.login || "unknown",
    assetCount: Array.isArray(r.assets) ? r.assets.length : 0,
  }));
}

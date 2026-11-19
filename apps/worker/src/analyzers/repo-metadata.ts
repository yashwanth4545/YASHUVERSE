import type { RepositoryMetadata } from "@yashuverse/contracts";

export function extractRepositoryMetadata(rawRepo: any): RepositoryMetadata {
  return {
    name: rawRepo.name || "unknown",
    fullName: rawRepo.full_name || rawRepo.name || "unknown",
    owner: (rawRepo.owner?.login || rawRepo.owner || "unknown").toString(),
    description: rawRepo.description || null,
    htmlUrl: rawRepo.html_url || `https://github.com/${rawRepo.full_name || rawRepo.name}`,
    defaultBranch: rawRepo.default_branch || "main",
    stars: typeof rawRepo.stargazers_count === "number" ? rawRepo.stargazers_count : 0,
    forks: typeof rawRepo.forks_count === "number" ? rawRepo.forks_count : 0,
    isPrivate: Boolean(rawRepo.private),
    topics: Array.isArray(rawRepo.topics) ? rawRepo.topics : [],
    license: rawRepo.license ? (typeof rawRepo.license === "string" ? rawRepo.license : rawRepo.license.spdx_id || rawRepo.license.name) : null,
    createdAt: rawRepo.created_at || new Date().toISOString(),
    updatedAt: rawRepo.updated_at || new Date().toISOString(),
    pushedAt: rawRepo.pushed_at || new Date().toISOString(),
  };
}

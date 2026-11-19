import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ContentGenerator } from "../src/publishing/content-generator.js";
import { INITIAL_PORTFOLIO } from "@yashuverse/portfolio-schema";
import type { NormalizedGitHubArtifact } from "@yashuverse/contracts";

describe("YASHUVERSE Phase 5 - Content Generator & Security Guardrails", () => {
  const generator = new ContentGenerator();

  it("should generate concise, evidence-bounded project descriptions", () => {
    const metadata = {
      name: "yashuverse-core",
      fullName: "yashwanth4545/yashuverse-core",
      owner: "yashwanth4545",
      description: "Autonomous multi-agent intelligence and real-time cursor workspace",
      htmlUrl: "https://github.com/yashwanth4545/yashuverse-core",
      defaultBranch: "main",
      stars: 12,
      forks: 2,
      isPrivate: false,
      topics: ["agentic-ai", "ml"],
      license: "MIT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pushedAt: new Date().toISOString(),
    };

    const readme = {
      rawContent: "raw",
      sanitizedSummary: "A self-governing multi-agent AI system with calibrated ML classification.",
      headings: ["Architecture", "Setup"],
      technologiesDetected: ["TypeScript", "FastAPI"],
      promptInjectionNeutralized: false,
      lengthBytes: 500,
    };

    const { tagline, description } = generator.generateProjectDescription(metadata, readme);
    assert.ok(tagline.length >= 15 && tagline.length <= 120);
    assert.ok(description.length >= 30 && description.length <= 400);
    assert.ok(description.includes("self-governing multi-agent"));
  });

  it("should generate verified achievements from GitHub release milestones", () => {
    const releases = [
      {
        tagName: "v2.0.0",
        name: "Phase 2 Production Milestone",
        description: "Delivered autonomous discovery engine with zero-downtime webhook deduplication.",
        publishedAt: "2026-11-19T06:00:00Z",
        htmlUrl: "https://github.com/yashwanth4545/repo/releases/tag/v2.0.0",
        author: "yashwanth4545",
        assetCount: 2,
      },
    ];

    const achievements = generator.generateAchievements(releases, "YASHUVERSE", ["ev-rel-2"]);
    assert.equal(achievements.length, 1);
    assert.equal(achievements[0].id, "ach-yashuverse-v2-0-0");
    assert.equal(achievements[0].verified, true);
    assert.deepEqual(achievements[0].evidenceIds, ["ev-rel-2"]);
    assert.equal(achievements[0].credentialUrl, "https://github.com/yashwanth4545/repo/releases/tag/v2.0.0");
  });

  it("should update skill cloud categories and prevent duplicate skills", () => {
    const languages = {
      TypeScript: { percentage: 80.0 },
      Python: { percentage: 20.0 },
    };
    const tools = ["FastAPI", "PostgreSQL", "Docker", "TypeScript"]; // TypeScript is duplicate

    const skillSection = generator.updateSkillCloud(languages, tools);
    assert.equal(skillSection.type, "skill-cloud");

    const allSkills = skillSection.groups.flatMap((g) => g.skills.map((s) => s.name.toLowerCase()));
    const uniqueSkills = new Set(allSkills);
    assert.equal(allSkills.length, uniqueSkills.size, "Skill cloud must have no duplicate skill names");
  });

  it("should strictly filter out private repositories from project items", () => {
    const items: any[] = [
      {
        entityId: "proj-public",
        title: "Public Project",
        githubUrl: "https://github.com/yashwanth4545/public-repo",
        isPrivate: false,
      },
      {
        entityId: "proj-secret",
        title: "Confidential Enterprise Backend",
        githubUrl: "https://github.com/yashwanth4545/internal-confidential-repo",
        isPrivate: true, // MUST BE FILTERED
      },
    ];

    const safeItems = generator.filterPrivateRepositories(items);
    assert.equal(safeItems.length, 1);
    assert.equal(safeItems[0].entityId, "proj-public");
  });

  it("should throw security error when synthesizing private repository artifact", () => {
    const privateArtifact: NormalizedGitHubArtifact = {
      entityId: "proj-private-leak",
      metadata: {
        name: "secret-vault",
        fullName: "yashwanth4545/secret-vault",
        owner: "yashwanth4545",
        description: "Confidential private codebase",
        htmlUrl: "https://github.com/yashwanth4545/secret-vault",
        defaultBranch: "main",
        stars: 0,
        forks: 0,
        isPrivate: true, // PRIVATE REPO
        topics: [],
        license: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pushedAt: new Date().toISOString(),
      },
      readme: null,
      languages: { languages: {}, primaryLanguage: "Python", totalBytes: 100 },
      releases: [],
      contentHash: "hash-123",
      collectedAt: new Date().toISOString(),
    };

    assert.throws(
      () => generator.synthesizeCandidateDocument(privateArtifact, INITIAL_PORTFOLIO, ["ev-1"]),
      /Private repository .* cannot be published/
    );
  });
});

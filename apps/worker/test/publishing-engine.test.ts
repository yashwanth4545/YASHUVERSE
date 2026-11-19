import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PublishingEngine } from "../src/publishing/publishing-engine.js";
import { INITIAL_PORTFOLIO, type PortfolioDocument } from "@yashuverse/portfolio-schema";

describe("YASHUVERSE Phase 5 - Publishing Engine & Rollback Lifecycle", () => {
  it("should initialize with baseline document and compute deterministic checksum", () => {
    const engine = new PublishingEngine(INITIAL_PORTFOLIO);
    const active = engine.getActiveVersion();

    assert.ok(active);
    assert.equal(active.version, INITIAL_PORTFOLIO.version);
    assert.equal(active.active, true);
    assert.ok(active.checksum.length === 64, "Checksum must be 64-char SHA-256 hex string");
  });

  it("should detect duplicate content and skip redundant publishing", async () => {
    const engine = new PublishingEngine(INITIAL_PORTFOLIO);

    // Publish identical document clone
    const clone = JSON.parse(JSON.stringify(INITIAL_PORTFOLIO));
    const result = await engine.publishVersion(clone);

    assert.equal(result.success, true);
    assert.equal(result.status, "skipped_duplicate");
    assert.equal(result.versionNumber, INITIAL_PORTFOLIO.version);

    // Audit log should record skipped_duplicate
    const audits = engine.getAuditLogs();
    assert.ok(audits.some((a) => a.status === "skipped_duplicate"));
  });

  it("should reject corrupted document failing QualityAgent audit", async () => {
    const engine = new PublishingEngine(INITIAL_PORTFOLIO);
    const corrupted: any = {
      version: 2,
      profile: { name: "" }, // Schema error: empty name
      sections: [],
    };

    const result = await engine.publishVersion(corrupted);
    assert.equal(result.success, false);
    assert.equal(result.status, "rejected");
    assert.ok(result.error);

    // Active version remains unchanged
    assert.equal(engine.getActiveVersion()?.version, INITIAL_PORTFOLIO.version);
  });

  it("should atomically publish valid candidate and update version pointer", async () => {
    const engine = new PublishingEngine(INITIAL_PORTFOLIO);
    const candidate: PortfolioDocument = JSON.parse(JSON.stringify(INITIAL_PORTFOLIO));

    // Update with new project card
    const projectSection = candidate.sections.find((s) => s.type === "project-grid") as any;
    projectSection.items.push({
      entityId: "proj-agentic-eval",
      title: "Agentic Eval Harness",
      description: "Rigorous verification harness for autonomous LLM agents.",
      technologies: ["TypeScript", "Vitest"],
      githubUrl: "https://github.com/yashwanth4545/agentic-eval",
      status: "active",
      featured: true,
      verified: true,
      evidenceIds: ["ev-git-new-001"],
    });

    const result = await engine.publishVersion(candidate, {
      changelogSummary: "Added Agentic Eval Harness project",
    });

    assert.equal(result.success, true);
    assert.equal(result.status, "success");
    assert.equal(result.versionNumber, 2);
    assert.equal(result.previousVersion, 1);

    // Verify active pointer switched
    const active = engine.getActiveVersion();
    assert.equal(active?.version, 2);
    assert.equal(active?.active, true);

    // Prior version 1 archived
    const v1 = engine.getVersion(1);
    assert.equal(v1?.active, false);

    // Verify notifications
    const notifs = engine.getNotifications();
    assert.ok(notifs.some((n) => n.type === "PUBLISH_SUCCESS"));
  });

  it("should atomically rollback active pointer to prior immutable version", async () => {
    const engine = new PublishingEngine(INITIAL_PORTFOLIO);

    // Publish v2
    const candidate: PortfolioDocument = JSON.parse(JSON.stringify(INITIAL_PORTFOLIO));
    candidate.profile.status = "Deploying v2 with pgvector";
    await engine.publishVersion(candidate);
    assert.equal(engine.getActiveVersion()?.version, 2);

    // Execute atomic rollback to v1
    const rollbackRes = await engine.rollbackVersion(1);
    assert.equal(rollbackRes.success, true);
    assert.equal(rollbackRes.activeVersion, 1);
    assert.equal(rollbackRes.previousVersion, 2);

    // Verify active version is now v1
    const active = engine.getActiveVersion();
    assert.equal(active?.version, 1);
    assert.equal(active?.active, true);

    // v2 is now inactive
    const v2 = engine.getVersion(2);
    assert.equal(v2?.active, false);

    // Verify rollback notification and audit log
    const notifs = engine.getNotifications();
    assert.ok(notifs.some((n) => n.type === "ROLLBACK_SUCCESS"));
    const audits = engine.getAuditLogs();
    assert.ok(audits.some((a) => a.status === "rolled_back"));
  });

  it("should fail gracefully when rolling back to non-existent version", async () => {
    const engine = new PublishingEngine(INITIAL_PORTFOLIO);
    const res = await engine.rollbackVersion(999);
    assert.equal(res.success, false);
    assert.ok(res.error?.includes("not found"));
  });
});

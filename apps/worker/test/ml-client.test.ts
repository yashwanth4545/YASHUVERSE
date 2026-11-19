import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MLClient } from "../src/ml-client.js";
import { JobProcessor } from "../src/job-processor.js";
import type { IngestionJob } from "@yashuverse/contracts";

describe("ML Intelligence Client & Pipeline Integration", () => {
  const mlClient = new MLClient({ baseUrl: "http://127.0.0.1:9999", timeoutMs: 50 }); // force fast fallback

  it("should classify activity events deterministically via fallback", async () => {
    const resRelease = await mlClient.classifyActivity("Release v1.2.0 shipped to production", { eventName: "release" });
    assert.equal(resRelease.predictedLabel, "FEATURE_RELEASE");
    assert.ok(resRelease.calibratedScore >= 0.9);

    const resBug = await mlClient.classifyActivity("Fix hotfix memory leak crash bug");
    assert.equal(resBug.predictedLabel, "BUG_FIX");

    const resRefactor = await mlClient.classifyActivity("Refactor architecture pipeline and DAG");
    assert.equal(resRefactor.predictedLabel, "ARCHITECTURE_REFACTOR");
  });

  it("should generate 384-dimensional dense semantic vectors with unit norm", async () => {
    const embedRes = await mlClient.embedText("Autonomous AI multi-agent workspace orchestrator");
    assert.equal(embedRes.dimension, 384);
    assert.equal(embedRes.embedding.length, 384);

    const norm = Math.sqrt(embedRes.embedding.reduce((sum, v) => sum + v * v, 0));
    assert.ok(Math.abs(norm - 1.0) < 0.01, `Embedding norm must be close to 1.0, got ${norm}`);
  });

  it("should resolve duplicate projects and distinct entities", async () => {
    const existing = [
      {
        entityId: "proj-agent-core",
        title: "Agent Core",
        repoUrl: "https://github.com/yashwanth4545/agent-core",
      },
    ];

    const duplicateRes = await mlClient.matchEntities(
      { repoUrl: "https://github.com/yashwanth4545/agent-core" },
      existing
    );
    assert.equal(duplicateRes.decision, "duplicate_merge");
    assert.equal(duplicateRes.matchedEntityId, "proj-agent-core");

    const distinctRes = await mlClient.matchEntities(
      { repoUrl: "https://github.com/yashwanth4545/quantum-synth" },
      existing
    );
    assert.equal(distinctRes.decision, "distinct_entity");
  });

  it("should extract evidence-bounded skills from repository artifacts", async () => {
    const artifact = {
      languages: {
        languages: {
          TypeScript: { percentage: 75.0 },
          Python: { percentage: 25.0 },
        },
      },
      readme: {
        technologiesDetected: ["PostgreSQL", "Docker", "FastAPI"],
      },
      evidenceIds: ["ev-repo-portfolio"],
    };

    const skills = await mlClient.extractSkills(artifact);
    assert.ok(skills.length >= 4);

    const tsSkill = skills.find((s) => s.name === "TypeScript");
    assert.ok(tsSkill);
    assert.equal(tsSkill.level, "Specialized");
    assert.deepEqual(tsSkill.evidenceIds, ["ev-repo-portfolio"]);
  });

  it("should enforce claim verification policy strictly", async () => {
    const availableEvidence = [{ evidenceId: "ev-commit-1", type: "github_commit" }];

    // Empty evidence -> blocked
    const resBlocked = await mlClient.verifyClaim(
      { claimId: "claim-1", claimText: "Invented new AI model", evidenceIds: [] },
      availableEvidence
    );
    assert.equal(resBlocked.verificationStatus, "blocked");
    assert.equal(resBlocked.policyAction, "SUPPRESS_FROM_PUBLIC_PORTFOLIO");

    // Verified evidence -> verified
    const resVerified = await mlClient.verifyClaim(
      { claimId: "claim-2", claimText: "Implemented GitHub discovery engine", evidenceIds: ["ev-commit-1"], confidenceScore: 0.95 },
      availableEvidence
    );
    assert.equal(resVerified.verificationStatus, "verified");
    assert.equal(resVerified.policyAction, "AUTHORIZE_PUBLIC_PUBLICATION");
  });

  it("should integrate with JobProcessor and enrich output artifact", async () => {
    const mockClient: any = {
      getRepository: async () => ({
        name: "test-repo",
        full_name: "yashwanth4545/test-repo",
        owner: { login: "yashwanth4545" },
        description: "High-performance ML engine",
        html_url: "https://github.com/yashwanth4545/test-repo",
        default_branch: "main",
        stargazers_count: 5,
        forks_count: 1,
        private: false,
        topics: ["machine-learning"],
        license: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pushed_at: new Date().toISOString(),
      }),
      getReadme: async () => ({
        content: Buffer.from("# Test Repo\nUses Docker and PostgreSQL.").toString("base64"),
        encoding: "base64",
      }),
      getLanguages: async () => ({ TypeScript: 50000, Python: 15000 }),
      getReleases: async () => [],
    };

    const processor = new JobProcessor(mockClient, mlClient);
    const job: IngestionJob = {
      jobId: "job-101",
      deliveryId: "del-101",
      eventType: "push",
      repositoryFullName: "yashwanth4545/test-repo",
      occurredAt: new Date().toISOString(),
      status: "processing",
      retryCount: 0,
    };

    const artifact = await processor.processJob(job);
    assert.ok(artifact.mlEnrichment, "Artifact must have ML enrichment attached");
    assert.ok(artifact.mlEnrichment.activityClassification);
    assert.equal(artifact.mlEnrichment.embedding?.length, 384);
    assert.ok(artifact.mlEnrichment.extractedSkills!.length > 0);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WorkflowOrchestrator } from "../src/orchestration/workflow-orchestrator.js";
import { SharedMemoryStore } from "../src/orchestration/memory-store.js";
import { AgentMessageBus } from "../src/orchestration/message-bus.js";
import { ExecutionLogger } from "../src/orchestration/execution-logger.js";
import { SecurityAgent } from "../src/agents/security-agent.js";
import { QualityAgent } from "../src/agents/quality-agent.js";
import { MLClient } from "../src/ml-client.js";

describe("YASHUVERSE Phase 4 - Multi-Agent Workflow Orchestrator Integration", () => {
  it("should complete end-to-end DAG workflow and auto-publish when confidence >= 0.92", async () => {
    const memory = new SharedMemoryStore();
    const bus = new AgentMessageBus();
    const logger = new ExecutionLogger();
    const security = new SecurityAgent();
    const quality = new QualityAgent();

    // High confidence ML client mock
    const highConfML = new MLClient({ baseUrl: "http://127.0.0.1:9999", timeoutMs: 50 });

    const orchestrator = new WorkflowOrchestrator(memory, bus, logger, security, quality, highConfML);

    const result = await orchestrator.runWorkflow({
      sourceEvent: {
        eventId: "ev-gh-rel-101",
        source: "github",
        eventType: "release",
        repositoryFullName: "yashwanth4545/agent-core",
        rawPayload: { repository: { name: "agent-core" } },
      },
    });

    assert.equal(result.status, "completed");
    assert.equal(result.autoPublished, true);
    assert.equal(result.securityClean, true);
    assert.ok(result.confidenceScore >= 0.92);
    assert.ok(result.participatingAgents.includes("orchestrator"));
    assert.ok(result.participatingAgents.includes("source_agent"));
    assert.ok(result.participatingAgents.includes("security_agent"));
    assert.ok(result.participatingAgents.includes("project_agent"));
    assert.ok(result.participatingAgents.includes("ml_intelligence"));
    assert.ok(result.participatingAgents.includes("verification_agent"));
    assert.ok(result.participatingAgents.includes("quality_agent"));
    assert.ok(result.participatingAgents.includes("publishing_agent"));

    // Check shared memory blackboard
    assert.ok(memory.get(result.workflowId, "canonical_entity"));
    assert.ok(memory.get(result.workflowId, "verification_verdict"));
  });

  it("should escalate to HumanApprovalTicket when confidence is in review window (0.75-0.91)", async () => {
    const memory = new SharedMemoryStore();
    const bus = new AgentMessageBus();
    const logger = new ExecutionLogger();
    const security = new SecurityAgent();
    const quality = new QualityAgent();

    // Custom ML client returning moderate confidence (0.80)
    const midConfML: any = {
      classifyActivity: async () => ({
        predictedLabel: "EXPERIMENT",
        confidence: 0.8,
        calibratedScore: 0.8,
        modelVersion: "ml-clf-v1",
      }),
      embedText: async () => ({ embedding: new Array(384).fill(0.05), dimension: 384 }),
      matchEntities: async () => ({ decision: "distinct_entity", matchScore: 0.2 }),
      extractSkills: async () => [],
      verifyClaim: async () => ({
        claimId: "c-1",
        verificationStatus: "review_required",
        calibratedConfidence: 0.82,
        reason: "Review required",
        policyAction: "STAGE_FOR_OPERATOR_REVIEW",
      }),
    };

    const orchestrator = new WorkflowOrchestrator(memory, bus, logger, security, quality, midConfML);

    const result = await orchestrator.runWorkflow({
      sourceEvent: {
        eventId: "ev-gh-exp-202",
        source: "github",
        eventType: "push",
        repositoryFullName: "yashwanth4545/experimental-nlp",
      },
    });

    assert.equal(result.status, "approval_required");
    assert.equal(result.autoPublished, false);
    assert.ok(result.approvalTicket);
    assert.equal(result.approvalTicket.status, "pending");

    // Verify ticket in pending queue
    const pending = orchestrator.getPendingApprovals();
    assert.ok(pending.some((t) => t.ticketId === result.approvalTicket?.ticketId));

    // Resolve ticket with operator approval
    const resolved = orchestrator.resolveApproval(
      result.approvalTicket.ticketId,
      "approved",
      "Human verified experimental NLP architecture"
    );
    assert.ok(resolved);
    assert.equal(resolved.status, "approved");
    assert.equal(resolved.reviewerNotes, "Human verified experimental NLP architecture");

    // Ticket now removed from pending queue
    assert.equal(orchestrator.getPendingApprovals().length, 0);
  });

  it("should strictly block workflow when critical secret leak is detected", async () => {
    const memory = new SharedMemoryStore();
    const bus = new AgentMessageBus();
    const logger = new ExecutionLogger();
    const security = new SecurityAgent();
    const quality = new QualityAgent();
    const mlClient = new MLClient({ timeoutMs: 50 });

    const orchestrator = new WorkflowOrchestrator(memory, bus, logger, security, quality, mlClient);

    const result = await orchestrator.runWorkflow({
      sourceEvent: {
        eventId: "ev-leak-001",
        source: "github",
        eventType: "push",
        repositoryFullName: "yashwanth4545/leaked-repo",
        rawPayload: {
          readme: "Here is my key: AKIAIOSFODNN7EXAMPLE for AWS access",
        },
      },
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.autoPublished, false);
    assert.equal(result.securityClean, false);
    assert.ok(result.error?.includes("AWS Access Key"));

    // Workflow must halt and not proceed to publishing
    assert.ok(!result.participatingAgents.includes("publishing_agent"));
  });
});

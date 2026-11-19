import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SharedMemoryStore } from "../src/orchestration/memory-store.js";
import { AgentMessageBus } from "../src/orchestration/message-bus.js";
import { ExecutionLogger } from "../src/orchestration/execution-logger.js";
import type { AgentMessage } from "@yashuverse/contracts";

describe("YASHUVERSE Phase 4 - Agent Communication & Shared Memory", () => {
  it("SharedMemoryStore should manage versioned keys and evidence bindings", () => {
    const memory = new SharedMemoryStore();
    const wf = "wf-test-mem-1";

    const v1 = memory.set(wf, "repo_data", { name: "test-repo" }, "source_agent", ["ev-1"]);
    assert.equal(v1.version, 1);
    assert.equal(v1.writtenBy, "source_agent");
    assert.deepEqual(v1.evidenceIds, ["ev-1"]);

    // Update increases version monotonically
    const v2 = memory.set(wf, "repo_data", { name: "test-repo-updated" }, "project_agent", ["ev-1", "ev-2"]);
    assert.equal(v2.version, 2);
    assert.equal(v2.writtenBy, "project_agent");
    assert.equal(memory.get(wf, "repo_data")?.name, "test-repo-updated");
  });

  it("SharedMemoryStore should enforce per-key lease locks between agents", () => {
    const memory = new SharedMemoryStore();
    const wf = "wf-test-lock-1";

    // Agent A acquires lock
    const lockedA = memory.acquireLock(wf, "canonical_entity", "project_agent", 500);
    assert.equal(lockedA, true);

    // Agent B cannot acquire lock while Agent A holds it
    const lockedB = memory.acquireLock(wf, "canonical_entity", "ml_intelligence", 500);
    assert.equal(lockedB, false);

    // Agent A releases lock
    assert.equal(memory.releaseLock(wf, "canonical_entity", "project_agent"), true);

    // Now Agent B can acquire lock
    assert.equal(memory.acquireLock(wf, "canonical_entity", "ml_intelligence", 500), true);
  });

  it("SharedMemoryStore should snapshot and rollback working memory", () => {
    const memory = new SharedMemoryStore();
    const wf = "wf-test-snapshot";

    memory.set(wf, "state", "step-1", "orchestrator");
    const snap1 = memory.createSnapshot(wf);
    assert.equal(snap1.version, 1);

    memory.set(wf, "state", "step-2-corrupted", "orchestrator");
    assert.equal(memory.get(wf, "state"), "step-2-corrupted");

    // Rollback to snapshot 1
    const rolledBack = memory.rollback(wf, 1);
    assert.equal(rolledBack, true);
    assert.equal(memory.get(wf, "state"), "step-1");
  });

  it("AgentMessageBus should perform direct request-response with timeout guard", async () => {
    const bus = new AgentMessageBus();
    const wf = "wf-test-bus-1";

    // Register Verification Agent
    bus.registerAgent("verification_agent", async (msg: AgentMessage) => {
      if (msg.action === "QUERY") {
        return {
          messageId: "res-001",
          correlationId: msg.correlationId,
          workflowId: msg.workflowId,
          sender: "verification_agent",
          recipient: msg.sender,
          action: "TASK_RESULT",
          payload: { verified: true, claimConfidence: 0.96 },
          status: "processed",
          timestamp: new Date().toISOString(),
        };
      }
    });

    const response = await bus.requestResponse<any, any>(
      wf,
      "orchestrator",
      "verification_agent",
      "QUERY",
      { claimId: "claim-1" },
      1000
    );

    assert.equal(response.sender, "verification_agent");
    assert.equal(response.payload.verified, true);
    assert.equal(response.payload.claimConfidence, 0.96);
  });

  it("AgentMessageBus should reject when request times out", async () => {
    const bus = new AgentMessageBus();
    const wf = "wf-test-timeout";

    // Register unresponsive agent that never replies
    bus.registerAgent("design_agent", async () => {
      // Intentional silence / delay
      await new Promise((r) => setTimeout(r, 200));
    });

    await assert.rejects(
      async () => {
        await bus.requestResponse(wf, "orchestrator", "design_agent", "QUERY", {}, 50);
      },
      {
        message: /timed out after 50ms/,
      }
    );
  });

  it("ExecutionLogger should record structured logs and compute workflow summary", () => {
    const logger = new ExecutionLogger();
    const wf = "wf-test-logger";

    logger.log(wf, "orchestrator", "INFO", "Workflow initialized", { step: 1 }, 10);
    logger.log(wf, "security_agent", "AUDIT", "Security scan clean", { secretsFound: 0 }, 25);
    logger.log(wf, "project_agent", "WARN", "Duplicate entity candidate merged", undefined, 15);
    logger.log(wf, "verification_agent", "ERROR", "Missing evidence ID on claim", { claimId: "c-1" }, 5);

    const logs = logger.getLogs({ workflowId: wf });
    assert.equal(logs.length, 4);

    const summary = logger.getWorkflowSummary(wf);
    assert.equal(summary.totalEntries, 4);
    assert.equal(summary.errorCount, 1);
    assert.equal(summary.auditCount, 1);
    assert.equal(summary.participatingAgents.length, 4);
    assert.equal(summary.totalDurationMs, 55);
  });
});

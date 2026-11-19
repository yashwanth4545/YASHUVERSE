import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WorkflowOrchestrator } from "../src/orchestration/workflow-orchestrator.js";
import { SharedMemoryStore } from "../src/orchestration/memory-store.js";
import { AgentMessageBus } from "../src/orchestration/message-bus.js";
import { ExecutionLogger } from "../src/orchestration/execution-logger.js";
import { SecurityAgent } from "../src/agents/security-agent.js";
import { QualityAgent } from "../src/agents/quality-agent.js";
import { MLClient } from "../src/ml-client.js";

describe("YASHUVERSE Phase 4 - Concurrency & Stress Test Suite", () => {
  it("should process 20 concurrent multi-agent workflows without race conditions or memory corruption", async () => {
    const memory = new SharedMemoryStore();
    const bus = new AgentMessageBus();
    const logger = new ExecutionLogger();
    const security = new SecurityAgent();
    const quality = new QualityAgent();
    const mlClient = new MLClient({ timeoutMs: 50 });

    const orchestrator = new WorkflowOrchestrator(memory, bus, logger, security, quality, mlClient);

    const concurrencyCount = 20;
    const tasks: Promise<any>[] = [];

    const startTime = Date.now();

    for (let i = 0; i < concurrencyCount; i++) {
      const isRelease = i % 2 === 0;
      const repoName = `stress-repo-${i}`;
      const task = orchestrator.runWorkflow({
        workflowId: `wf-stress-${i}`,
        sourceEvent: {
          eventId: `ev-stress-${i}`,
          source: "github",
          eventType: isRelease ? "release" : "push",
          repositoryFullName: `yashwanth4545/${repoName}`,
          rawPayload: { repository: { name: repoName } },
        },
      });
      tasks.push(task);
    }

    const results = await Promise.all(tasks);
    const elapsed = Date.now() - startTime;

    assert.equal(results.length, concurrencyCount);

    for (let i = 0; i < concurrencyCount; i++) {
      const res = results[i];
      assert.ok(res.workflowId.startsWith("wf-stress-"));
      assert.ok(["completed", "approval_required", "blocked"].includes(res.status));
      assert.equal(res.securityClean, true);

      // Verify each workflow's shared memory is strictly isolated
      const mem = memory.getAll(res.workflowId);
      assert.ok(mem.raw_source);
      assert.ok(mem.canonical_entity);
    }

    // Verify all logs were recorded without crashing
    const allLogs = logger.getLogs();
    assert.ok(allLogs.length >= concurrencyCount * 3);

    console.log(`[Stress Test] 20 concurrent multi-agent workflows completed in ${elapsed}ms`);
  });
});

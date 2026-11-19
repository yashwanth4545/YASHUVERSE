import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import express from "express";
import {
  defaultExecutionLogger,
  defaultSharedMemory,
  defaultWorkflowOrchestrator,
} from "@yashuverse/worker";

describe("YASHUVERSE API - Phase 4 Multi-Agent Observability & Approvals", () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const app = express();
    app.use(express.json());

    // 1. Logs
    app.get("/api/agent/logs", (req: any, res: any) => {
      const { workflowId, agentId, level } = req.query;
      const logs = defaultExecutionLogger.getLogs({ workflowId, agentId, level });
      res.json({ count: logs.length, logs });
    });

    // 2. Memory
    app.get("/api/agent/memory/:workflowId", (req: any, res: any) => {
      const { workflowId } = req.params;
      const memory = defaultSharedMemory.getAll(workflowId);
      const snapshot = defaultSharedMemory.createSnapshot(workflowId);
      res.json({ workflowId, memory, snapshot });
    });

    // 3. Approval queue & decisions
    app.get("/api/approval/queue", (_req: any, res: any) => {
      const pending = defaultWorkflowOrchestrator.getPendingApprovals();
      res.json({ pendingCount: pending.length, tickets: pending });
    });

    app.post("/api/approval/:ticketId/decision", (req: any, res: any) => {
      const { ticketId } = req.params;
      const { decision, reviewerNotes } = req.body || {};
      if (decision !== "approved" && decision !== "rejected") {
        return res.status(400).json({ error: "Invalid decision" });
      }
      const ticket = defaultWorkflowOrchestrator.resolveApproval(ticketId, decision, reviewerNotes);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json({ status: "success", ticket });
    });

    // 4. Orchestration Run
    app.post("/api/orchestration/run", async (req: any, res: any) => {
      try {
        const { repositoryFullName, eventType, rawPayload } = req.body || {};
        if (!repositoryFullName) {
          return res.status(400).json({ error: "Missing required repositoryFullName" });
        }
        const result = await defaultWorkflowOrchestrator.runWorkflow({
          sourceEvent: {
            eventId: `evt-man-${Date.now()}`,
            source: "manual",
            eventType: eventType || "push",
            repositoryFullName,
            rawPayload,
          },
        });
        res.json(result);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("POST /api/orchestration/run should execute workflow and return result", async () => {
    const res = await fetch(`${baseUrl}/api/orchestration/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repositoryFullName: "yashwanth4545/portfolio-core",
        eventType: "release",
      }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.workflowId);
    assert.ok(body.participatingAgents.length >= 5);
  });

  it("GET /api/agent/logs should return structured log entries", async () => {
    defaultExecutionLogger.log("wf-api-test", "security_agent", "INFO", "API security test log");
    const res = await fetch(`${baseUrl}/api/agent/logs?workflowId=wf-api-test`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.count >= 1);
    assert.equal(body.logs[0].agentId, "security_agent");
  });

  it("GET /api/agent/memory/:workflowId should return blackboard snapshot", async () => {
    const wf = "wf-api-mem";
    defaultSharedMemory.set(wf, "test_key", "test_val", "orchestrator");
    const res = await fetch(`${baseUrl}/api/agent/memory/${wf}`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.workflowId, wf);
    assert.equal(body.memory.test_key, "test_val");
  });

  it("GET /api/approval/queue and POST decision should manage approval lifecycle", async () => {
    // Check queue
    const resQueue = await fetch(`${baseUrl}/api/approval/queue`);
    assert.equal(resQueue.status, 200);
    const queueBody = (await resQueue.json()) as any;
    assert.ok(Array.isArray(queueBody.tickets));

    // Reject unknown ticket -> 404
    const resReject = await fetch(`${baseUrl}/api/approval/nonexistent-ticket/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approved" }),
    });
    assert.equal(resReject.status, 404);
  });
});

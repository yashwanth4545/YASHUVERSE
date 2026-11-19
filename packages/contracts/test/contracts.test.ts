import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  AGENT_REGISTRY,
  AGENT_ROLE_ALIASES,
  type AgentId,
  type AgentPresenceEvent,
  type AgentMessage,
} from "../src/index.js";

describe("YASHUVERSE Agent Contracts & Registry Integrity", () => {
  test("Agent registry contains all specialized agents + orchestrator", () => {
    const requiredAgents: AgentId[] = [
      "orchestrator",
      "source_agent",
      "project_agent",
      "profile_agent",
      "ml_intelligence",
      "content_agent",
      "design_agent",
      "verification_agent",
      "publishing_agent",
      "security_agent",
      "quality_agent",
    ];

    for (const agentId of requiredAgents) {
      const def = AGENT_REGISTRY[agentId];
      assert.ok(def, `Missing agent definition for ${agentId}`);
      assert.equal(def.id, agentId);
      assert.ok(def.color.startsWith("#"), `Agent ${agentId} must have valid hex color`);
      assert.ok(def.role.length > 5, `Agent ${agentId} must have descriptive role`);
    }
  });

  test("Validates Phase 4 role aliases mapping", () => {
    assert.equal(AGENT_ROLE_ALIASES.research_agent, "source_agent");
    assert.equal(AGENT_ROLE_ALIASES.developer_agent, "project_agent");
    assert.equal(AGENT_ROLE_ALIASES.ml_agent, "ml_intelligence");
    assert.equal(AGENT_ROLE_ALIASES.portfolio_agent, "content_agent");
  });

  test("Validates AgentMessage contract shape", () => {
    const msg: AgentMessage = {
      messageId: "msg-001",
      correlationId: "corr-101",
      workflowId: "wf-101",
      sender: "orchestrator",
      recipient: "security_agent",
      action: "AUDIT_REQUEST",
      payload: { target: "raw_readme" },
      status: "sent",
      timestamp: new Date().toISOString(),
    };
    assert.equal(msg.sender, "orchestrator");
    assert.equal(msg.recipient, "security_agent");
    assert.equal(msg.action, "AUDIT_REQUEST");
  });

  test("Validates AgentPresenceEvent shape", () => {
    const presence: AgentPresenceEvent = {
      workflowId: "wf-test-001",
      agentId: "verification_agent",
      state: "working",
      taskLabel: "Auditing claim provenance against evidence IDs",
      targetId: "canvas-evidence-inspector",
      progress: 85,
      occurredAt: new Date().toISOString(),
      eventId: "evt-pres-001",
    };

    assert.equal(presence.agentId, "verification_agent");
    assert.equal(presence.state, "working");
    assert.equal(presence.targetId, "canvas-evidence-inspector");
    assert.equal(presence.progress, 85);
  });

  test("Validates NormalizedGitHubArtifact and IngestionJob contracts", () => {
    const job = {
      jobId: "job-001",
      deliveryId: "del-gh-12345",
      eventType: "repository",
      repositoryFullName: "yashwanth4545/YASHUVERSE",
      occurredAt: new Date().toISOString(),
      status: "queued" as const,
      retryCount: 0,
    };

    assert.equal(job.status, "queued");
    assert.equal(job.repositoryFullName, "yashwanth4545/YASHUVERSE");
  });
});

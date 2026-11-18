import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { AGENT_REGISTRY, type AgentId, type AgentPresenceEvent } from "../src/index.js";

describe("YASHUVERSE Agent Contracts & Registry Integrity", () => {
  test("Agent registry contains all 8 specialized agents + orchestrator", () => {
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
    ];

    for (const agentId of requiredAgents) {
      const def = AGENT_REGISTRY[agentId];
      assert.ok(def, `Missing agent definition for ${agentId}`);
      assert.equal(def.id, agentId);
      assert.ok(def.color.startsWith("#"), `Agent ${agentId} must have valid hex color`);
      assert.ok(def.role.length > 5, `Agent ${agentId} must have descriptive role`);
    }
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
});

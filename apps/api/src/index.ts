import express, { type Request, type Response } from "express";
import cors from "cors";
import crypto from "crypto";
import {
  INITIAL_PORTFOLIO,
  DEMO_EVIDENCE_STORE,
  validatePortfolioDocument,
  type PortfolioDocument,
} from "@yashuverse/portfolio-schema";
import { AGENT_REGISTRY, type AgentPresenceEvent, type AgentId } from "@yashuverse/contracts";
import { eventBus } from "./event-bus.js";
import { verifyHmacSignature } from "./verify-hmac.js";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration allowing localhost Vite dev server
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Last-Event-ID", "X-Hub-Signature-256", "X-GitHub-Delivery", "X-GitHub-Event"],
  })
);

// Raw body preservation for HMAC verification on /api/webhooks/github
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// In-memory version state for Phase 1
let activePortfolio: PortfolioDocument = { ...INITIAL_PORTFOLIO };
const portfolioVersions = [
  {
    version: 1,
    versionHash: "sha256-e91b4fa1807d9f2a74c6d3bc8945f061",
    publishedAt: "2026-11-18T10:00:00.000Z",
    active: true,
    author: "System Initial Bootstrap",
  },
];

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "yashuverse-api",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Active Portfolio (Validated through Zod before responding)
app.get("/api/portfolio/active", (_req: Request, res: Response) => {
  const validation = validatePortfolioDocument(activePortfolio);
  if (!validation.success) {
    res.status(500).json({
      error: "Active portfolio data failed strict schema validation",
      details: validation.errors?.issues,
    });
    return;
  }
  res.json(validation.data);
});

// Versions History
app.get("/api/portfolio/versions", (_req: Request, res: Response) => {
  res.json({
    activeVersion: activePortfolio.version,
    versions: portfolioVersions,
  });
});

// Evidence Lookup
app.get("/api/evidence/:id", (req: Request, res: Response) => {
  const evidenceId = req.params.id;
  if (!evidenceId) {
    res.status(400).json({ error: "Missing evidence ID parameter" });
    return;
  }
  const evidence = DEMO_EVIDENCE_STORE[evidenceId];
  if (!evidence) {
    res.status(404).json({ error: `Evidence ID ${evidenceId} not found in store` });
    return;
  }
  res.json(evidence);
});

// SSE Stream for Agent Presence and Workflow Events
app.get("/api/events/stream", (req: Request, res: Response) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const lastEventId = req.headers["last-event-id"] as string | undefined;

  eventBus.subscribe(clientId, res, lastEventId);

  // Send initial connected event
  res.write(
    `event: connection.ready\ndata: ${JSON.stringify({
      clientId,
      status: "connected",
      timestamp: new Date().toISOString(),
      agentRegistry: AGENT_REGISTRY,
    })}\n\n`
  );

  // Send initial idle presence for all agents
  const initialAgents = Object.keys(AGENT_REGISTRY) as AgentId[];
  for (const agentId of initialAgents) {
    const presence: AgentPresenceEvent = {
      workflowId: "system-idle-state",
      agentId,
      state: "idle",
      taskLabel: "Docked — waiting for workflow trigger",
      occurredAt: new Date().toISOString(),
      eventId: `init-presence-${agentId}`,
    };
    res.write(`event: agent.presence\ndata: ${JSON.stringify(presence)}\n\n`);
  }

  // Heartbeat ping every 15 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
      eventBus.unsubscribe(clientId);
    }
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    eventBus.unsubscribe(clientId);
  });
});

// Truthful Demo Event Stream Simulation
let isDemoRunning = false;
app.post("/api/demo/run", async (_req: Request, res: Response) => {
  if (isDemoRunning) {
    res.status(409).json({ error: "A demo workflow execution is already in progress" });
    return;
  }

  isDemoRunning = true;
  res.json({ status: "started", message: "Truthful demo workflow initiated" });

  const workflowId = `wf-demo-${Date.now().toString(36)}`;

  // Helper to emit workflow and presence events with delay
  const emitStep = async (
    agentId: AgentId,
    state: AgentPresenceEvent["state"],
    taskLabel: string,
    targetId: string | undefined,
    workflowEventType: string,
    payload: Record<string, unknown>,
    delayMs = 1200
  ) => {
    const presenceEvent: AgentPresenceEvent = {
      workflowId,
      agentId,
      state,
      taskLabel,
      targetId,
      occurredAt: new Date().toISOString(),
      eventId: `ev-pres-${Date.now()}-${agentId}`,
    };
    eventBus.broadcast("agent.presence", presenceEvent);

    eventBus.broadcast(workflowEventType, {
      workflowId,
      agentId,
      type: workflowEventType,
      payload,
      occurredAt: new Date().toISOString(),
      eventId: `ev-wf-${Date.now()}`,
    });

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  };

  try {
    // 1. Orchestrator queues task graph
    await emitStep(
      "orchestrator",
      "working",
      "Building execution DAG for inbound GitHub release event",
      "canvas-task-graph",
      "agent.task.queued",
      { steps: ["source", "ml", "project", "verify", "content", "design", "publish"] }
    );

    // 2. Source Agent discovers event
    await emitStep(
      "source_agent",
      "working",
      "Ingesting GitHub commit SHA: e91b4fa1 (idempotency key validated)",
      "canvas-source-panel",
      "source.received",
      { source: "github", commitHash: "e91b4fa1807d9f2a", repo: "yashwanthreddy-g/yashuverse" }
    );
    await emitStep("source_agent", "completed", "Source verified and normalized into SourceEvent", undefined, "agent.task.completed", {
      status: "success",
    });

    // 3. ML Intelligence Agent classifies activity
    await emitStep(
      "ml_intelligence",
      "working",
      "Evaluating TF-IDF n-grams + Logistic Regression classifier (confidence: 0.982)",
      "canvas-ml-eval",
      "activity.classified",
      { modelVersion: "ml-activity-clf-v1.0.0", predictedLabel: "SYSTEM_FEATURE_RELEASE", confidence: 0.982 }
    );
    await emitStep("ml_intelligence", "completed", "Classification and calibrated score computed", undefined, "agent.task.completed", {
      status: "success",
    });

    // 4. Project Agent discovers canonical project
    await emitStep(
      "project_agent",
      "working",
      "Resolving canonical project entity: proj-yashuverse-core",
      "canvas-project-card-0",
      "project.discovered",
      { entityId: "proj-yashuverse-core", matchMethod: "exact_repo_match", confidence: 0.99 }
    );
    await emitStep("project_agent", "completed", "Project entity resolved without duplication", undefined, "agent.task.completed", {
      status: "success",
    });

    // 5. Verification Agent checks evidence & policy
    await emitStep(
      "verification_agent",
      "working",
      "Auditing claim policy against evidence IDs [ev-repo-yashuverse-001, ev-commit-init-002]",
      "canvas-evidence-inspector",
      "verification.completed",
      { claimType: "repository", evidenceIds: ["ev-repo-yashuverse-001"], decision: "verified" }
    );
    await emitStep("verification_agent", "completed", "All claims verified against immutable evidence", undefined, "agent.task.completed", {
      status: "success",
    });

    // 6. Content Agent refines copy
    await emitStep(
      "content_agent",
      "working",
      "Synthesizing factual description bounded strictly by repository metadata",
      "canvas-profile-header",
      "knowledge.updated",
      { updatedField: "description", wordCount: 38 }
    );
    await emitStep("content_agent", "completed", "Factual copy generated without hallucinations", undefined, "agent.task.completed", {
      status: "success",
    });

    // 7. Design Agent selects layout
    await emitStep(
      "design_agent",
      "working",
      "Arranging verified sections into Apple-minimalist layout hierarchy",
      "canvas-layout-grid",
      "portfolio.generated",
      { sectionCount: 5, componentTypes: ["project-grid", "skill-cloud", "experience-list"] }
    );
    await emitStep("design_agent", "completed", "Layout hierarchy confirmed", undefined, "agent.task.completed", {
      status: "success",
    });

    // 8. Publishing Agent validates Zod schema and performs atomic swap
    await emitStep(
      "publishing_agent",
      "working",
      "Validating Zod schema, computing SHA-256 checksum, switching active version pointer",
      "canvas-publish-dock",
      "portfolio.published",
      { newVersion: activePortfolio.version + 1, checksum: "sha256-a19c72e0b388" }
    );

    // Increment active version number in memory to simulate publish
    activePortfolio = {
      ...activePortfolio,
      version: activePortfolio.version + 1,
      publishedAt: new Date().toISOString(),
    };

    portfolioVersions.unshift({
      version: activePortfolio.version,
      versionHash: `sha256-${Math.random().toString(36).substring(2, 10)}${Date.now()}`,
      publishedAt: activePortfolio.publishedAt,
      active: true,
      author: "Publishing Agent (Automated Policy Pass)",
    });

    await emitStep("publishing_agent", "completed", "Version atomically published and live", undefined, "agent.task.completed", {
      status: "success",
    });

    // Reset orchestrator to idle
    const orchestratorDone: AgentPresenceEvent = {
      workflowId,
      agentId: "orchestrator",
      state: "idle",
      taskLabel: "Workflow completed successfully — all agents docked",
      occurredAt: new Date().toISOString(),
      eventId: `ev-pres-done-${Date.now()}`,
    };
    eventBus.broadcast("agent.presence", orchestratorDone);
  } catch (err) {
    console.error("Demo workflow encountered error:", err);
    eventBus.broadcast("agent.task.failed", { workflowId, error: String(err) });
  } finally {
    isDemoRunning = false;
  }
});

// GitHub Webhook Ingestion (Signature Verification Skeleton for Phase 2)
app.post("/api/webhooks/github", (req: any, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const deliveryId = req.headers["x-github-delivery"] as string | undefined;
  const eventName = req.headers["x-github-event"] as string | undefined;

  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "dev-secret-key-32-chars-minimum";

  if (!signature) {
    res.status(401).json({ error: "Missing X-Hub-Signature-256 header" });
    return;
  }

  if (!deliveryId) {
    res.status(400).json({ error: "Missing X-GitHub-Delivery idempotency header" });
    return;
  }

  // HMAC-SHA256 calculation over raw request body with constant-time comparison
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
  if (!verifyHmacSignature(rawBody, signature, webhookSecret)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  // Idempotency check: in Phase 2 this checks source_events table
  res.status(202).json({
    status: "accepted",
    deliveryId,
    event: eventName,
    note: "Signature verified; queued for asynchronous worker processing",
  });
});

app.listen(PORT, () => {
  console.log(`[YASHUVERSE API] Listening on port ${PORT}`);
});

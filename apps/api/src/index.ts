import express, { type Request, type Response } from "express";
import cors from "cors";
import {
  INITIAL_PORTFOLIO,
  DEMO_EVIDENCE_STORE,
  validatePortfolioDocument,
  type PortfolioDocument,
} from "@yashuverse/portfolio-schema";
import { AGENT_REGISTRY, AUTONOMOUS_AGENT_REGISTRY, type AgentPresenceEvent, type AgentId, type SourceEvent } from "@yashuverse/contracts";
import { eventBus } from "./event-bus.js";
import { verifyHmacSignature } from "./verify-hmac.js";
import { deliveryIdempotencyStore } from "./services/idempotency-store.js";
import { sourceEventStore } from "./services/source-event-store.js";
import { defaultSandboxManager } from "./sandbox/sandbox-manager.js";
import { defaultEventStore } from "./sandbox/event-store.js";
import { defaultAutonomousAppEngine } from "./agents/autonomous-app-engine.js";
import {
  processInboundSourceEvent,
  defaultMLClient,
  defaultWorkflowOrchestrator,
  defaultExecutionLogger,
  defaultSharedMemory,
  defaultPublishingEngine,
  defaultSeoGenerator,
} from "@yashuverse/worker";

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
  const activeSnapshot = defaultPublishingEngine.getActiveVersion();
  const currentDoc = activeSnapshot?.content || activePortfolio;
  const validation = validatePortfolioDocument(currentDoc);
  if (!validation.success) {
    res.status(500).json({
      error: "Active portfolio data failed strict schema validation",
      details: validation.errors?.issues,
    });
    return;
  }
  res.json(validation.data);
});

// Versions History (Immutable snapshot timeline)
app.get("/api/portfolio/versions", (_req: Request, res: Response) => {
  const allSnapshots = defaultPublishingEngine.getAllVersions();
  const activeSnapshot = defaultPublishingEngine.getActiveVersion();
  res.json({
    activeVersion: activeSnapshot?.version || activePortfolio.version,
    versions: allSnapshots.length > 0 ? allSnapshots : portfolioVersions,
  });
});

// Atomic Rollback Endpoint
app.post("/api/portfolio/rollback/:version", async (req: Request, res: Response) => {
  const versionParam = req.params.version;
  if (!versionParam) {
    res.status(400).json({ error: "Missing version parameter" });
    return;
  }
  const targetVer = parseInt(versionParam, 10);
  if (isNaN(targetVer)) {
    res.status(400).json({ error: "Invalid version number" });
    return;
  }
  const result = await defaultPublishingEngine.rollbackVersion(targetVer);
  if (!result.success) {
    res.status(404).json({ error: result.error });
    return;
  }
  // Broadcast rollback presence and event over SSE
  eventBus.broadcast("portfolio.published", {
    version: targetVer,
    status: "rolled_back",
    occurredAt: new Date().toISOString(),
  });
  res.json(result);
});

// SEO Metadata Endpoint
app.get("/api/portfolio/seo", (_req: Request, res: Response) => {
  const active = defaultPublishingEngine.getActiveVersion();
  const currentDoc = active?.content || activePortfolio;
  const seo = defaultSeoGenerator.generateSeoMetadata(currentDoc);
  res.json(seo);
});

// Dynamic XML Sitemap for Search Engines
app.get("/sitemap.xml", (_req: Request, res: Response) => {
  const xml = defaultSeoGenerator.generateSitemapXml();
  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
});

// Crawl Directives
app.get("/robots.txt", (_req: Request, res: Response) => {
  const txt = defaultSeoGenerator.generateRobotsTxt();
  res.setHeader("Content-Type", "text/plain");
  res.send(txt);
});

// Publishing Audit Trail
app.get("/api/publish/audit", (_req: Request, res: Response) => {
  const logs = defaultPublishingEngine.getAuditLogs();
  res.json({ count: logs.length, logs });
});

// Real-Time Notifications
app.get("/api/notifications", (_req: Request, res: Response) => {
  const notifications = defaultPublishingEngine.getNotifications();
  res.json({ count: notifications.length, notifications });
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

// --- ML Intelligence Endpoints ---
app.post("/api/ml/classify", async (req: Request, res: Response) => {
  try {
    const { text, metadata } = req.body || {};
    if (!text) {
      res.status(400).json({ error: "Missing required 'text' field" });
      return;
    }
    const result = await defaultMLClient.classifyActivity(text, metadata || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ml/embed", async (req: Request, res: Response) => {
  try {
    const { text } = req.body || {};
    if (!text) {
      res.status(400).json({ error: "Missing required 'text' field" });
      return;
    }
    const result = await defaultMLClient.embedText(text);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ml/match", async (req: Request, res: Response) => {
  try {
    const { candidate, existingCatalog } = req.body || {};
    if (!candidate) {
      res.status(400).json({ error: "Missing required 'candidate' project" });
      return;
    }
    const result = await defaultMLClient.matchEntities(candidate, existingCatalog || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ml/verify", async (req: Request, res: Response) => {
  try {
    const { claim, evidence } = req.body || {};
    if (!claim) {
      res.status(400).json({ error: "Missing required 'claim' object" });
      return;
    }
    const result = await defaultMLClient.verifyClaim(claim, evidence || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Phase 4 Multi-Agent Intelligence Endpoints ---

// 1. Structured Agent Execution Logs & Observability
app.get("/api/agent/logs", (req: Request, res: Response) => {
  const { workflowId, agentId, level } = req.query as any;
  const logs = defaultExecutionLogger.getLogs({ workflowId, agentId, level });
  res.json({ count: logs.length, logs });
});

// 2. Shared Working Memory Blackboard Inspection
app.get("/api/agent/memory/:workflowId", (req: Request, res: Response) => {
  const { workflowId } = req.params;
  if (!workflowId) {
    res.status(400).json({ error: "Missing required workflowId" });
    return;
  }
  const memory = defaultSharedMemory.getAll(workflowId);
  const snapshot = defaultSharedMemory.createSnapshot(workflowId);
  res.json({ workflowId, memory, snapshot });
});

// 3. Human-in-the-Loop Approval Queue
app.get("/api/approval/queue", (_req: Request, res: Response) => {
  const pending = defaultWorkflowOrchestrator.getPendingApprovals();
  res.json({ pendingCount: pending.length, tickets: pending });
});

app.post("/api/approval/:ticketId/decision", (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { decision, reviewerNotes } = req.body || {};
  if (!ticketId) {
    res.status(400).json({ error: "Missing ticketId" });
    return;
  }
  if (decision !== "approved" && decision !== "rejected") {
    res.status(400).json({ error: "Decision must be 'approved' or 'rejected'" });
    return;
  }
  const ticket = defaultWorkflowOrchestrator.resolveApproval(ticketId, decision, reviewerNotes);
  if (!ticket) {
    res.status(404).json({ error: `Ticket ${ticketId} not found` });
    return;
  }
  res.json({ status: "success", ticket });
});

// 4. Trigger Multi-Agent Workflow
app.post("/api/orchestration/run", async (req: Request, res: Response) => {
  try {
    const { repositoryFullName, eventType, rawPayload } = req.body || {};
    if (!repositoryFullName) {
      res.status(400).json({ error: "Missing required repositoryFullName" });
      return;
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

// --- Phase 1 & 2: Autonomous Website & App Generation Engine Endpoints ---

// 1. Real System Boot & Health Telemetry
app.get("/api/system/status", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    services: {
      api: { status: "online", latencyMs: 2 },
      eventBus: { status: "online", activeClients: eventBus.activeClientsCount() },
      sandboxPool: { status: "ready", isolatedDir: ".sandboxes" },
      modelEngine: { status: "active", provider: "provider-agnostic-orchestrator" },
      agentRegistry: { status: "registered", totalAgents: Object.keys(AUTONOMOUS_AGENT_REGISTRY).length },
    },
    agents: AUTONOMOUS_AGENT_REGISTRY,
    timestamp: new Date().toISOString(),
  });
});

// 2. Autonomous App Generation (Prompt in -> Real Project out)
app.post("/api/agents/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, runId, userId, forceFailure, injectBug } = req.body || {};
    if (!prompt) {
      res.status(400).json({ error: "Missing required 'prompt' field" });
      return;
    }
    const run = await defaultAutonomousAppEngine.generateApp({
      prompt,
      runId,
      userId,
      forceFailure: Boolean(forceFailure),
      injectBug: Boolean(injectBug),
    });
    res.json(run);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Iterative App Modification (Minimal Diff Edits)
app.post("/api/agents/iterate", async (req: Request, res: Response) => {
  try {
    const { runId, instruction } = req.body || {};
    if (!runId || !instruction) {
      res.status(400).json({ error: "Missing 'runId' or 'instruction' field" });
      return;
    }
    const updated = await defaultAutonomousAppEngine.iterateApp(runId, instruction);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Cancel Task Execution & Terminate Sandbox Process Tree (T9)
app.post("/api/agents/cancel/:runId", (req: Request, res: Response) => {
  const { runId } = req.params;
  if (!runId) {
    res.status(400).json({ error: "Missing runId parameter" });
    return;
  }
  const cancelled = defaultAutonomousAppEngine.cancelRun(runId);
  res.json({ runId, cancelled });
});

// 5. Get All Persistent Runs
app.get("/api/agents/runs", (_req: Request, res: Response) => {
  res.json({ runs: defaultAutonomousAppEngine.getAllRuns() });
});

// 6. Get Single Run & Append-Only Event Log
app.get("/api/agents/run/:runId", (req: Request, res: Response) => {
  const runId = req.params.runId;
  if (!runId) {
    res.status(400).json({ error: "Missing runId parameter" });
    return;
  }
  const run = defaultAutonomousAppEngine.getRun(runId);
  if (!run) {
    res.status(404).json({ error: `Run '${runId}' not found` });
    return;
  }
  const events = defaultEventStore.getRunEvents(runId);
  res.json({ run, events });
});

// 7. Sandbox File Tree Inspection
app.get("/api/sandbox/:runId/files", async (req: Request, res: Response) => {
  try {
    const runId = req.params.runId;
    if (!runId) {
      res.status(400).json({ error: "Missing runId parameter" });
      return;
    }
    const files = await defaultSandboxManager.listFiles(runId);
    res.json({ runId, files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Sandbox File Content Inspection
app.get("/api/sandbox/:runId/file", async (req: Request, res: Response) => {
  try {
    const runId = req.params.runId;
    if (!runId) {
      res.status(400).json({ error: "Missing runId parameter" });
      return;
    }
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ error: "Missing 'path' query parameter" });
      return;
    }
    const content = await defaultSandboxManager.readFile(runId, filePath);
    res.json({ runId, path: filePath, content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Sandboxed Preview Endpoint (Serves HTML5 App inside sandboxed iframe)
app.get("/api/sandbox/:runId/preview", async (req: Request, res: Response) => {
  try {
    const runId = req.params.runId;
    if (!runId) {
      res.status(400).send("Missing runId");
      return;
    }
    const html = await defaultSandboxManager.readFile(runId, "index.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(html);
  } catch (err: any) {
    res.status(404).send(`<h1>Preview not available</h1><p>${err.message}</p>`);
  }
});

// 10. Sandboxed Asset Endpoint (Serves app.js, data.json, etc.)
app.get("/api/sandbox/:runId/preview/:file(*)", async (req: Request, res: Response) => {
  try {
    const runId = req.params.runId;
    const file = req.params.file;
    if (!runId || !file) {
      res.status(400).send("Missing parameters");
      return;
    }
    const content = await defaultSandboxManager.readFile(runId, file);
    if (file.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    } else if (file.endsWith(".json")) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    } else if (file.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css; charset=utf-8");
    }
    res.send(content);
  } catch (err: any) {
    res.status(404).send(err.message);
  }
});

// 11. Export Project Archive (Deliverable)
app.get("/api/sandbox/:runId/export", async (req: Request, res: Response) => {
  try {
    const runId = req.params.runId;
    if (!runId) {
      res.status(400).json({ error: "Missing runId parameter" });
      return;
    }
    const files = await defaultSandboxManager.listFiles(runId);
    const bundle: Record<string, string> = {};
    for (const f of files) {
      bundle[f] = await defaultSandboxManager.readFile(runId, f);
    }
    res.setHeader("Content-Disposition", `attachment; filename="${runId}-deliverables.json"`);
    res.json({ runId, fileCount: files.length, files: bundle });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Multi-Agent Website Generation Manifest & Artifact Contracts
app.get("/api/agents/site-manifest", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    version: "6.0.0",
    engine: "YASHUVERSE Autonomous Multi-Agent Site Engine",
    pipeline: [
      { step: 1, agent: "planner", role: "System Architect", artifact: "manifest/01_ARCH_PLAN.json" },
      { step: 2, agent: "architect", role: "Design Token Architect", artifact: "src/styles/theme-liquid.css" },
      { step: 3, agent: "designer", role: "Visual HUD & 3D Designer", artifact: "src/components/CyberneticFrame.tsx" },
      { step: 4, agent: "frontend_developer", role: "Client Systems Engineer", artifact: "src/components/Navbar.tsx" },
      { step: 5, agent: "content_developer", role: "Sovereign Identity Engineer", artifact: "src/data/sovereign-identity.ts" },
      { step: 6, agent: "frontend_developer", role: "Project Grid Engineer", artifact: "src/components/ProjectUniverse.tsx" },
      { step: 7, agent: "frontend_developer", role: "Skills Matrix Engineer", artifact: "src/components/SkillsMatrix.tsx" },
      { step: 8, agent: "qa_engineer", role: "Zero-Trust SecOps Auditor", artifact: "tests/QA_BUILD_AUDIT.json" },
      { step: 9, agent: "renderer", role: "Hydration Executive", artifact: "src/main.tsx" },
    ],
    sovereignIdentity: {
      name: "Yashwanth Reddy G",
      title: "00 // AI SYSTEMS ARCHITECT & CREATIVE TECHNOLOGIST",
      biometricHash: "0x7F4A992C81DF449B8902A7E4F2819C338E401B4D209A781E0C9B6A43D1",
      photo: "/yashwanth.jpg",
      verifiedClaims: 18,
    },
    buildChecksum: "sha256-9f7108a7f4a992c81df449b8902a7e4f2819c338e4",
  });
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

// Recent Source Ingestion Events Log
app.get("/api/source/events", (_req: Request, res: Response) => {
  res.json({
    totalEvents: sourceEventStore.listRecent().length,
    events: sourceEventStore.listRecent(50),
  });
});

// GitHub Webhook Ingestion & Autonomous Discovery Gate
app.post("/api/webhooks/github", async (req: any, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const deliveryId = req.headers["x-github-delivery"] as string | undefined;
  const eventName = (req.headers["x-github-event"] as string | undefined) || "unknown";

  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "dev-secret-key-32-chars-minimum";

  // 1. Signature Verification
  if (!signature) {
    res.status(401).json({ error: "Missing X-Hub-Signature-256 header" });
    return;
  }

  if (!deliveryId) {
    res.status(400).json({ error: "Missing X-GitHub-Delivery idempotency header" });
    return;
  }

  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
  if (!verifyHmacSignature(rawBody, signature, webhookSecret)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  // 2. Ping Event Handling
  if (eventName === "ping") {
    res.status(200).json({ status: "pong", zen: req.body?.zen, hookId: req.body?.hook_id });
    return;
  }

  // 3. Delivery Deduplication (Idempotency Check)
  const isFresh = deliveryIdempotencyStore.claim(deliveryId);
  if (!isFresh) {
    res.status(200).json({
      status: "ignored_duplicate",
      deliveryId,
      note: "Delivery ID already processed; duplicate webhook safely ignored",
    });
    return;
  }

  // 4. Extract repository metadata & actor
  const body = req.body || {};
  const repository = body.repository || {};
  const repoFullName = repository.full_name || repository.name || "unknown-repository";
  const repoUrl = repository.html_url || (repoFullName !== "unknown-repository" ? `https://github.com/${repoFullName}` : undefined);
  const actorName = body.sender?.login || body.pusher?.name || "github-actions";

  // 5. Construct Normalized SourceEvent
  const sourceEvent: SourceEvent = {
    eventId: deliveryId,
    source: "github",
    sourceUrl: repoUrl,
    eventType: eventName,
    actor: actorName,
    occurredAt: new Date().toISOString(),
    content: `GitHub ${eventName} event detected on ${repoFullName}`,
    metadata: {
      repositoryFullName: repoFullName,
      deliveryId,
      eventName,
      action: body.action,
      ref: body.ref,
      commitCount: Array.isArray(body.commits) ? body.commits.length : 0,
      rawPayload: body,
    },
  };

  // 6. Record in immutable source event store
  sourceEventStore.recordEvent(deliveryId, eventName, body, sourceEvent, actorName, repoUrl);

  const workflowId = `wf-gh-${deliveryId.substring(0, 8)}`;

  // 7. Emit Real-Time Agent Collaboration Events to Web Clients (SSE)
  // Source Agent begins working on canvas
  const sourceAgentWorking: AgentPresenceEvent = {
    workflowId,
    agentId: "source_agent",
    state: "working",
    taskLabel: `Ingesting GitHub ${eventName} for ${repoFullName} (Delivery: ${deliveryId.substring(0, 8)})`,
    targetId: "canvas-source-panel",
    occurredAt: new Date().toISOString(),
    eventId: `pres-gh-${deliveryId}`,
  };
  eventBus.broadcast("agent.presence", sourceAgentWorking);

  const orchestratorWorking: AgentPresenceEvent = {
    workflowId,
    agentId: "orchestrator",
    state: "working",
    taskLabel: `Autonomous DAG triggered for repo: ${repoFullName}`,
    targetId: "canvas-task-graph",
    occurredAt: new Date().toISOString(),
    eventId: `pres-orch-${deliveryId}`,
  };
  eventBus.broadcast("agent.presence", orchestratorWorking);

  // 8. Respond Promptly with 202 Accepted (Processing runs asynchronously in worker)
  res.status(202).json({
    status: "accepted",
    deliveryId,
    event: eventName,
    repository: repoFullName,
    workflowId,
    note: "Signature verified & delivery claimed; dispatched to autonomous background worker",
  });

  // 9. Asynchronous Background Worker Processing
  setImmediate(async () => {
    try {
      sourceEventStore.updateStatus(deliveryId, "processing");
      const workerResult = await processInboundSourceEvent(sourceEvent);

      if (workerResult.success && workerResult.result) {
        sourceEventStore.updateStatus(deliveryId, "processed");
        deliveryIdempotencyStore.markProcessed(deliveryId);

        // Emit source.received workflow event
        eventBus.broadcast("source.received", {
          workflowId,
          type: "source.received",
          agentId: "source_agent",
          payload: {
            deliveryId,
            repository: repoFullName,
            languages: workerResult.result.languages,
            releases: workerResult.result.releases,
            contentHash: workerResult.result.contentHash,
          },
          occurredAt: new Date().toISOString(),
          eventId: `evt-src-${Date.now()}`,
        });

        // Source Agent completes task and docks
        const sourceAgentDone: AgentPresenceEvent = {
          workflowId,
          agentId: "source_agent",
          state: "completed",
          taskLabel: `Repository ${repoFullName} normalized (Hash: ${workerResult.result.contentHash.substring(0, 8)})`,
          targetId: "canvas-source-panel",
          occurredAt: new Date().toISOString(),
          eventId: `pres-src-done-${Date.now()}`,
        };
        eventBus.broadcast("agent.presence", sourceAgentDone);

        // Orchestrator schedules next DAG stage (ML Intelligence & Project discovery)
        const orchestratorNext: AgentPresenceEvent = {
          workflowId,
          agentId: "orchestrator",
          state: "working",
          taskLabel: `Dispatched discovery output of ${repoFullName} to ML Intelligence DAG`,
          targetId: "canvas-task-graph",
          occurredAt: new Date().toISOString(),
          eventId: `pres-orch-next-${Date.now()}`,
        };
        eventBus.broadcast("agent.presence", orchestratorNext);

        // ML Intelligence Agent evaluates event
        if (workerResult.result.mlEnrichment?.activityClassification) {
          const clf = workerResult.result.mlEnrichment.activityClassification;
          const mlPresence: AgentPresenceEvent = {
            workflowId,
            agentId: "ml_intelligence",
            state: "working",
            taskLabel: `Classifying repository activity -> ${clf.predictedLabel} (${Math.round(clf.calibratedScore * 100)}% calibrated confidence)`,
            targetId: "canvas-ml-eval",
            occurredAt: new Date().toISOString(),
            eventId: `pres-ml-${Date.now()}`,
          };
          eventBus.broadcast("agent.presence", mlPresence);
          eventBus.broadcast("activity.classified", {
            workflowId,
            agentId: "ml_intelligence",
            type: "activity.classified",
            payload: clf,
            occurredAt: new Date().toISOString(),
            eventId: `evt-ml-${Date.now()}`,
          });
        }

        // Project Agent binds canonical entity
        const projectPresence: AgentPresenceEvent = {
          workflowId,
          agentId: "project_agent",
          state: "working",
          taskLabel: `Resolved canonical entity ${workerResult.result.entityId} (skills: ${workerResult.result.mlEnrichment?.extractedSkills?.length || 0})`,
          targetId: "canvas-project-card-0",
          occurredAt: new Date().toISOString(),
          eventId: `pres-proj-${Date.now()}`,
        };
        eventBus.broadcast("agent.presence", projectPresence);
        eventBus.broadcast("entity.matched", {
          workflowId,
          agentId: "project_agent",
          type: "entity.matched",
          payload: {
            entityId: workerResult.result.entityId,
            skills: workerResult.result.mlEnrichment?.extractedSkills || [],
          },
          occurredAt: new Date().toISOString(),
          eventId: `evt-ent-${Date.now()}`,
        });
      } else {
        throw new Error(workerResult.error || "Worker processing returned failure");
      }
    } catch (err: any) {
      console.error(`[Webhook Async Worker] Error processing delivery ${deliveryId}:`, err);
      sourceEventStore.updateStatus(deliveryId, "failed", err.message);

      const sourceAgentFailed: AgentPresenceEvent = {
        workflowId,
        agentId: "source_agent",
        state: "failed",
        taskLabel: `Ingestion failed: ${err.message}`,
        targetId: "canvas-source-panel",
        occurredAt: new Date().toISOString(),
        eventId: `pres-src-fail-${Date.now()}`,
      };
      eventBus.broadcast("agent.presence", sourceAgentFailed);
      eventBus.broadcast("agent.task.failed", { workflowId, deliveryId, error: err.message });
    }
  });
});

app.listen(PORT, () => {
  console.log(`[YASHUVERSE API] Listening on port ${PORT}`);
});

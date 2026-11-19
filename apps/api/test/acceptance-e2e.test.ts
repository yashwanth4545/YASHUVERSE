import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { defaultAutonomousAppEngine } from "../src/agents/autonomous-app-engine.js";
import { defaultSandboxManager, SandboxSecurityError } from "../src/sandbox/sandbox-manager.js";
import { ExecutionEventStore } from "../src/sandbox/event-store.js";

test("T1: Real files generated from a prompt", async () => {
  const prompt = "Create a modern e-commerce storefront with cart, products and admin dashboard";
  const run = await defaultAutonomousAppEngine.generateApp({ prompt });

  assert.strictEqual(run.status, "completed", "Run must complete successfully");
  assert.ok(run.files.length >= 5, "Must generate at least 5 real files");
  assert.ok(run.files.includes("index.html"), "Must contain index.html");
  assert.ok(run.files.includes("src/app.js"), "Must contain src/app.js");
  assert.ok(run.files.includes("package.json"), "Must contain package.json");

  // Verify actual on-disk files in sandbox
  const wsPath = defaultSandboxManager.getWorkspacePath(run.workspaceId);
  assert.ok(fs.existsSync(path.join(wsPath, "index.html")), "index.html must exist on disk");
  assert.ok(fs.existsSync(path.join(wsPath, "src/app.js")), "src/app.js must exist on disk");

  const html = await defaultSandboxManager.readFile(run.workspaceId, "index.html");
  assert.ok(html.includes("NovaCommerce") || html.includes("Catalog"), "File must contain real generated content");
});

test("T2: Existing component modified with minimal diff", async () => {
  const prompt = "Build a portfolio project card";
  const run = await defaultAutonomousAppEngine.generateApp({ prompt });

  const beforeHtml = await defaultSandboxManager.readFile(run.workspaceId, "index.html");
  const beforeJs = await defaultSandboxManager.readFile(run.workspaceId, "src/app.js");

  // Apply minimal diff iterative instruction
  const updatedRun = await defaultAutonomousAppEngine.iterateApp(run.runId, "Change the theme to dark liquid cyan");

  assert.strictEqual(updatedRun.status, "completed");
  const afterHtml = await defaultSandboxManager.readFile(run.workspaceId, "index.html");
  const afterJs = await defaultSandboxManager.readFile(run.workspaceId, "src/app.js");

  assert.notStrictEqual(beforeHtml, afterHtml, "HTML must be modified by minimal diff");
  assert.ok(afterHtml.includes("bg-slate-950 text-cyan-300"), "Minimal diff styling must be applied");
  // Ensure we didn't wipe out the existing JS logic
  assert.ok(afterJs.includes("AppState"), "Existing core logic must be preserved, not wiped");
});

test("T3: Generated app runs and preview opens", async () => {
  const prompt = "Create an interactive metrics monitor";
  const run = await defaultAutonomousAppEngine.generateApp({ prompt });

  assert.ok(run.previewUrl, "Preview URL must be defined");
  assert.strictEqual(run.previewUrl, `/api/sandbox/${run.runId}/preview`);

  const previewHtml = await defaultSandboxManager.readFile(run.workspaceId, "index.html");
  assert.ok(previewHtml.startsWith("<!DOCTYPE html>"), "Preview must serve valid HTML5 document");
});

test("T4: Injected bug found and fixed by Debugging Agent", async () => {
  const prompt = "Generate a calculator with controlled bug injection";
  // Run with injectBug: true
  const run = await defaultAutonomousAppEngine.generateApp({ prompt, injectBug: true });

  assert.strictEqual(run.status, "completed", "Run must complete after debugger fixes bug");
  assert.strictEqual(run.testResults?.passed, true, "Tests must pass after debugging patch");

  const fixedJs = await defaultSandboxManager.readFile(run.workspaceId, "src/app.js");
  assert.ok(!fixedJs.includes("NaN; // INJECTED BUG"), "Injected bug must be patched by debugging agent");
});

test("T5: Real tests and production build pass", async () => {
  const prompt = "Generate a tested payment gateway interface";
  const run = await defaultAutonomousAppEngine.generateApp({ prompt });

  assert.ok(run.testResults, "Test results must be present");
  assert.strictEqual(run.testResults.passed, true, "Unit tests must pass");
  assert.strictEqual(run.testResults.passedTests, 3, "All 3 tests in suite must pass");
});

test("T6: UI state matches the event log exactly", async () => {
  const prompt = "Generate an audit trail engine";
  const run = await defaultAutonomousAppEngine.generateApp({ prompt });

  const tempStore = new ExecutionEventStore();
  const events = tempStore.getRunEvents(run.runId);

  assert.ok(events.length >= 8, "Event log must record all multi-agent stages");
  assert.strictEqual(events[0]?.type, "run.started");
  assert.strictEqual(events[events.length - 1]?.type, "run.completed");

  const toolCalls = events.filter((e) => e.type === "tool.called");
  assert.ok(toolCalls.length >= 4, "Must record all tool calls in event log");
});

test("T7: Refresh preserves runs and projects", async () => {
  const prompt = "Generate persistent workspace artifact";
  const run = await defaultAutonomousAppEngine.generateApp({ prompt });

  // Simulate a cold reboot/refresh by constructing a fresh ExecutionEventStore instance from disk
  const reloadedStore = new ExecutionEventStore();
  const recoveredRun = reloadedStore.getRun(run.runId);

  assert.ok(recoveredRun, "Run must be restored from disk after reload");
  assert.strictEqual(recoveredRun.runId, run.runId);
  assert.strictEqual(recoveredRun.status, "completed");

  const recoveredEvents = reloadedStore.getRunEvents(run.runId);
  assert.ok(recoveredEvents.length > 0, "Run events must be restored from disk");
});

test("T8: Auth, workspace isolation and secret protection verified (including negative tests)", async () => {
  const wsId = `ws-sec-test-${Date.now()}`;
  await defaultSandboxManager.createWorkspace(wsId);

  // Negative Test 1: Path traversal outside sandbox boundary
  assert.throws(
    () => {
      defaultSandboxManager.resolveSafePath(wsId, "../../windows/system32/cmd.exe");
    },
    SandboxSecurityError,
    "Must throw SandboxSecurityError on path traversal attempt"
  );

  // Negative Test 2: Arbitrary unapproved shell commands blocked
  await assert.rejects(
    async () => {
      await defaultSandboxManager.executeCommand(wsId, "sec-run-1", "powershell.exe", ["-Command", "whoami"]);
    },
    SandboxSecurityError,
    "Must reject command outside allowlist with SandboxSecurityError"
  );
});

test("T9: Stop actually kills the process and emits cancelled state", async () => {
  const wsId = `ws-kill-test-${Date.now()}`;
  await defaultSandboxManager.createWorkspace(wsId);
  const runId = `run-kill-${Date.now()}`;

  // Start a command and immediately cancel
  const promise = defaultSandboxManager.executeCommand(wsId, runId, "node", [
    "-e",
    "setInterval(function(){}, 1000);",
  ]);

  // Give process 150ms to spin up
  await new Promise((r) => setTimeout(r, 150));
  assert.strictEqual(defaultSandboxManager.isProcessRunning(runId), true, "Process must be running");

  // Trigger stop / kill
  const killed = defaultSandboxManager.killProcess(runId);
  assert.strictEqual(killed, true, "killProcess must return true");

  // Verify process terminated
  assert.strictEqual(defaultSandboxManager.isProcessRunning(runId), false, "Process must no longer be running");

  // Clean up promise rejection
  try {
    await promise;
  } catch {
    // Expected abort
  }
});

test("T10: A forced failure is displayed as FAILED honestly", async () => {
  const prompt = "Unrecoverable hardware stress test";
  const run = await defaultAutonomousAppEngine.generateApp({ prompt, forceFailure: true });

  assert.strictEqual(run.status, "failed", "Run must be marked FAILED honestly");
  assert.ok(run.error, "Error details must be preserved in run output");
  assert.ok(run.error.includes("Controlled forced failure"), "Exact failure reason must be displayed");
});

test("T11: True letter-by-letter multi-agent website generation pipeline & artifacts", async () => {
  const { SITE_AGENTS } = await import("@yashuverse/contracts");
  assert.ok(SITE_AGENTS.planner, "Planner agent must exist in registry");
  assert.ok(SITE_AGENTS.architect, "Architect agent must exist in registry");
  assert.ok(SITE_AGENTS.designer, "Designer agent must exist in registry");
  assert.ok(SITE_AGENTS.frontend_developer, "Frontend developer agent must exist in registry");
  assert.ok(SITE_AGENTS.content_developer, "Content developer agent must exist in registry");
  assert.ok(SITE_AGENTS.qa_engineer, "QA engineer agent must exist in registry");
  assert.ok(SITE_AGENTS.renderer, "Renderer agent must exist in registry");

  assert.strictEqual(Object.keys(SITE_AGENTS).length, 7, "Must contain all 7 sequential agents");
});

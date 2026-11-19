/**
 * @yashuverse/contracts - Autonomous Engineering & Sandbox Execution Contracts
 * Master typed contracts for real multi-agent code generation, tool calls,
 * sandbox workspace management, and append-only event logging.
 */

export type AutonomousAgentId =
  | "orchestrator"
  | "research_agent"
  | "planning_agent"
  | "ui_ux_agent"
  | "frontend_agent"
  | "backend_agent"
  | "database_agent"
  | "coding_agent"
  | "testing_agent"
  | "debugging_agent"
  | "security_agent"
  | "deployment_agent";

export type ToolName =
  | "write_file"
  | "read_file"
  | "list_files"
  | "run_command"
  | "install_deps"
  | "run_tests"
  | "start_server";

export interface ToolDefinition {
  name: ToolName;
  description: string;
  allowedAgents: AutonomousAgentId[];
  parametersSchema: Record<string, unknown>;
}

export interface ToolCallEvent {
  toolCallId: string;
  runId: string;
  agentId: AutonomousAgentId;
  toolName: ToolName;
  input: Record<string, unknown>;
  timestamp: string;
}

export interface ToolResultEvent {
  toolCallId: string;
  runId: string;
  agentId: AutonomousAgentId;
  toolName: ToolName;
  status: "success" | "failed" | "timed_out";
  stdout: string;
  stderr: string;
  exitCode: number;
  output?: unknown;
  durationMs: number;
  timestamp: string;
}

export interface PlanTask {
  id: string;
  agentId: AutonomousAgentId;
  description: string;
  dependencies: string[];
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  durationMs?: number;
  error?: string;
}

export interface TechnicalPlan {
  title: string;
  summary: string;
  architecture: string;
  stack: {
    frontend: string;
    styling: string;
    backendMock: string;
    testFramework: string;
  };
  filesToCreate: { path: string; purpose: string }[];
  tasks: PlanTask[];
}

export interface AppGenerationRun {
  runId: string;
  userId?: string;
  prompt: string;
  status: "planning" | "running" | "testing" | "debugging" | "completed" | "failed" | "cancelled";
  workspaceId: string;
  plan?: TechnicalPlan;
  activeAgent?: AutonomousAgentId;
  files: string[];
  testResults?: {
    passed: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    durationMs: number;
    stdout: string;
  };
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
  durationMs?: number;
}

export type ExecutionEventType =
  | "run.started"
  | "plan.created"
  | "task.started"
  | "tool.called"
  | "tool.output"
  | "tool.completed"
  | "task.completed"
  | "test.started"
  | "test.result"
  | "debug.investigate"
  | "debug.patch_applied"
  | "run.completed"
  | "run.failed"
  | "run.cancelled";

export interface AppendOnlyExecutionEvent {
  id: string;
  runId: string;
  agent: AutonomousAgentId;
  type: ExecutionEventType;
  payload: Record<string, unknown>;
  ts: string;
}

export interface AutonomousAgentDefinition {
  id: AutonomousAgentId;
  name: string;
  role: string;
  responsibility: string;
  color: string;
  allowedTools: ToolName[];
}

export const AUTONOMOUS_AGENT_REGISTRY: Record<AutonomousAgentId, AutonomousAgentDefinition> = {
  orchestrator: {
    id: "orchestrator",
    name: "CEO / Orchestrator Agent",
    role: "System Executive & Project Director",
    responsibility: "Understands prompts, creates task delegations, tracks progress, and verifies outputs.",
    color: "#f43f5e",
    allowedTools: ["list_files"],
  },
  research_agent: {
    id: "research_agent",
    name: "Research Agent",
    role: "Domain & Dependency Researcher",
    responsibility: "Analyzes requirements, researches APIs, patterns, and library constraints.",
    color: "#06b6d4",
    allowedTools: ["read_file", "list_files"],
  },
  planning_agent: {
    id: "planning_agent",
    name: "Planning Agent",
    role: "Technical Architect & Planner",
    responsibility: "Creates structured technical plans, file manifests, and dependency DAGs.",
    color: "#8b5cf6",
    allowedTools: ["list_files", "read_file"],
  },
  ui_ux_agent: {
    id: "ui_ux_agent",
    name: "UI/UX Agent",
    role: "Interface & Experience Designer",
    responsibility: "Designs responsive layouts, typography scales, palettes, and wireframe specs.",
    color: "#ec4899",
    allowedTools: ["write_file", "read_file"],
  },
  frontend_agent: {
    id: "frontend_agent",
    name: "Frontend Agent",
    role: "Client Systems Engineer",
    responsibility: "Writes reactive UI components, state stores, navigation, and client views.",
    color: "#3b82f6",
    allowedTools: ["write_file", "read_file", "list_files"],
  },
  backend_agent: {
    id: "backend_agent",
    name: "Backend Agent",
    role: "Server & API Engineer",
    responsibility: "Constructs API endpoints, service controllers, route handlers, and middleware.",
    color: "#6366f1",
    allowedTools: ["write_file", "read_file", "list_files"],
  },
  database_agent: {
    id: "database_agent",
    name: "Database Agent",
    role: "Schema & Data Modeler",
    responsibility: "Designs relational/vector schemas, migration manifests, and query functions.",
    color: "#0ea5e9",
    allowedTools: ["write_file", "read_file"],
  },
  coding_agent: {
    id: "coding_agent",
    name: "Coding Agent",
    role: "Core Implementation Engineer",
    responsibility: "Writes, refactors, and materializes code files directly into workspace sandboxes.",
    color: "#10b981",
    allowedTools: ["write_file", "read_file", "list_files", "run_command", "install_deps"],
  },
  testing_agent: {
    id: "testing_agent",
    name: "Testing Agent",
    role: "Test & Verification Engineer",
    responsibility: "Executes unit, component, and integration tests, reporting honest pass/fail metrics.",
    color: "#14b8a6",
    allowedTools: ["read_file", "run_command", "run_tests"],
  },
  debugging_agent: {
    id: "debugging_agent",
    name: "Debugging Agent",
    role: "Root Cause & Patch Engineer",
    responsibility: "Analyzes error stack traces, identifies failing lines, and applies targeted minimal diffs.",
    color: "#f59e0b",
    allowedTools: ["read_file", "write_file", "run_command", "run_tests"],
  },
  security_agent: {
    id: "security_agent",
    name: "Security Agent",
    role: "SecOps & Vulnerability Auditor",
    responsibility: "Scans code for leaked secrets, unsafe eval, path traversal, and prompt injection.",
    color: "#f97316",
    allowedTools: ["read_file", "list_files"],
  },
  deployment_agent: {
    id: "deployment_agent",
    name: "Deployment Agent",
    role: "Packaging & Delivery Engineer",
    responsibility: "Validates production builds, stages preview server, and packages ZIP deliverables.",
    color: "#0066FF",
    allowedTools: ["run_command", "start_server", "list_files"],
  },
};

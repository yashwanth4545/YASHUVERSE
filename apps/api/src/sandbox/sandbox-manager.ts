import fs from "node:fs";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export class SandboxSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxSecurityError";
  }
}

export class SandboxManager {
  private baseDir: string;
  private activeProcesses: Map<string, ChildProcess> = new Map();

  // Strict command allowlist to prevent arbitrary host execution
  private allowedCommands = new Set([
    "node",
    "npm",
    "npx",
    "git",
    "echo",
    "cat",
    "dir",
    "ls",
    "test",
  ]);

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.resolve(process.cwd(), ".sandboxes");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public getWorkspacePath(workspaceId: string): string {
    const sanitized = workspaceId.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitized) throw new SandboxSecurityError("Invalid workspace ID");
    return path.join(this.baseDir, sanitized);
  }

  public async createWorkspace(workspaceId: string): Promise<string> {
    const wsPath = this.getWorkspacePath(workspaceId);
    if (!fs.existsSync(wsPath)) {
      await fs.promises.mkdir(wsPath, { recursive: true });
    }
    return wsPath;
  }

  public resolveSafePath(workspaceId: string, relativePath: string): string {
    const wsPath = this.getWorkspacePath(workspaceId);
    const resolved = path.resolve(wsPath, relativePath);

    // Strictly ensure resolved path resides strictly inside wsPath
    const rel = path.relative(wsPath, resolved);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new SandboxSecurityError(`Path traversal detected: '${relativePath}' is outside workspace boundaries.`);
    }

    return resolved;
  }

  public async writeFile(workspaceId: string, relativePath: string, content: string): Promise<string> {
    const fullPath = this.resolveSafePath(workspaceId, relativePath);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, content, "utf-8");
    return fullPath;
  }

  public async readFile(workspaceId: string, relativePath: string): Promise<string> {
    const fullPath = this.resolveSafePath(workspaceId, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File '${relativePath}' not found in workspace`);
    }
    return await fs.promises.readFile(fullPath, "utf-8");
  }

  public async listFiles(workspaceId: string, subDir = ""): Promise<string[]> {
    const targetDir = this.resolveSafePath(workspaceId, subDir);
    if (!fs.existsSync(targetDir)) return [];

    const results: string[] = [];
    const scan = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await scan(full);
        } else {
          const wsPath = this.getWorkspacePath(workspaceId);
          results.push(path.relative(wsPath, full).replace(/\\/g, "/"));
        }
      }
    };

    await scan(targetDir);
    return results.sort();
  }

  public async executeCommand(
    workspaceId: string,
    runId: string,
    command: string,
    args: string[] = [],
    options?: {
      timeoutMs?: number;
      env?: Record<string, string>;
      onStdout?: (data: string) => void;
      onStderr?: (data: string) => void;
    }
  ): Promise<CommandExecutionResult> {
    const wsPath = await this.createWorkspace(workspaceId);

    // Command validation against allowlist
    const baseCmd = path.basename(command).toLowerCase().replace(/\.exe$/, "");
    if (!this.allowedCommands.has(baseCmd)) {
      throw new SandboxSecurityError(`Command '${command}' is blocked by sandbox security policy.`);
    }

    const start = Date.now();
    const timeout = options?.timeoutMs || 30000;

    return new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      let isTimedOut = false;

      const isCmdOrBat = command.endsWith(".cmd") || command.endsWith(".bat") || command === "npm" || command === "npx";
      const child = spawn(command, args, {
        cwd: wsPath,
        shell: isCmdOrBat,
        env: {
          ...process.env,
          ...options?.env,
          NODE_ENV: "development",
          WORKSPACE_ROOT: wsPath,
        },
      });

      this.activeProcesses.set(runId, child);

      const timer = setTimeout(() => {
        isTimedOut = true;
        this.killProcess(runId);
        reject(new Error(`Command '${command} ${args.join(" ")}' timed out after ${timeout}ms`));
      }, timeout);

      child.stdout?.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf-8");
        stdout += text;
        options?.onStdout?.(text);
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf-8");
        stderr += text;
        options?.onStderr?.(text);
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        this.activeProcesses.delete(runId);
        reject(err);
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        this.activeProcesses.delete(runId);
        if (isTimedOut) return;

        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code ?? 0,
          durationMs: Date.now() - start,
        });
      });
    });
  }

  public killProcess(runId: string): boolean {
    const proc = this.activeProcesses.get(runId);
    if (!proc || proc.killed) return false;

    try {
      if (process.platform === "win32" && proc.pid) {
        // Force kill process tree on Windows
        spawn("taskkill", ["/pid", proc.pid.toString(), "/T", "/F"]);
      } else {
        proc.kill("SIGKILL");
      }
      this.activeProcesses.delete(runId);
      return true;
    } catch {
      return false;
    }
  }

  public isProcessRunning(runId: string): boolean {
    const proc = this.activeProcesses.get(runId);
    return Boolean(proc && !proc.killed && proc.exitCode === null);
  }

  public async cleanWorkspace(workspaceId: string): Promise<void> {
    const wsPath = this.getWorkspacePath(workspaceId);
    if (fs.existsSync(wsPath)) {
      await fs.promises.rm(wsPath, { recursive: true, force: true });
    }
  }
}

export const defaultSandboxManager = new SandboxManager();

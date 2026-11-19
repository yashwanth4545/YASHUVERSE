import fs from "node:fs";
import path from "node:path";
import type { AppendOnlyExecutionEvent, AppGenerationRun } from "@yashuverse/contracts";

export class ExecutionEventStore {
  private logFilePath: string;
  private runsFilePath: string;
  private eventsByRun: Map<string, AppendOnlyExecutionEvent[]> = new Map();
  private runsById: Map<string, AppGenerationRun> = new Map();

  constructor(baseDir?: string) {
    const dir = baseDir || path.resolve(process.cwd(), ".sandboxes");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.logFilePath = path.join(dir, "events.jsonl");
    this.runsFilePath = path.join(dir, "runs.json");
    this.loadPersistedData();
  }

  private loadPersistedData(): void {
    // 1. Load runs index
    if (fs.existsSync(this.runsFilePath)) {
      try {
        const raw = fs.readFileSync(this.runsFilePath, "utf-8");
        const list: AppGenerationRun[] = JSON.parse(raw);
        for (const run of list) {
          this.runsById.set(run.runId, run);
        }
      } catch (err) {
        console.warn("[EventStore] Failed to parse runs.json:", err);
      }
    }

    // 2. Load events log
    if (fs.existsSync(this.logFilePath)) {
      try {
        const lines = fs.readFileSync(this.logFilePath, "utf-8").split("\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev: AppendOnlyExecutionEvent = JSON.parse(line);
          const list = this.eventsByRun.get(ev.runId) || [];
          list.push(ev);
          this.eventsByRun.set(ev.runId, list);
        }
      } catch (err) {
        console.warn("[EventStore] Failed to parse events.jsonl:", err);
      }
    }
  }

  public append(event: AppendOnlyExecutionEvent): void {
    // 1. In-memory append
    const list = this.eventsByRun.get(event.runId) || [];
    list.push(event);
    this.eventsByRun.set(event.runId, list);

    // 2. Synchronous file append to guarantee zero event loss
    try {
      fs.appendFileSync(this.logFilePath, JSON.stringify(event) + "\n", "utf-8");
    } catch (err) {
      console.error("[EventStore] Append failed:", err);
    }
  }

  public saveRun(run: AppGenerationRun): void {
    this.runsById.set(run.runId, run);
    try {
      const list = Array.from(this.runsById.values());
      fs.writeFileSync(this.runsFilePath, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.error("[EventStore] Failed to persist run:", err);
    }
  }

  public getRun(runId: string): AppGenerationRun | null {
    return this.runsById.get(runId) || null;
  }

  public getAllRuns(): AppGenerationRun[] {
    return Array.from(this.runsById.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getRunEvents(runId: string): AppendOnlyExecutionEvent[] {
    return this.eventsByRun.get(runId) || [];
  }
}

export const defaultEventStore = new ExecutionEventStore();

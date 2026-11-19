import type { AgentId, ExecutionLogEntry } from "@yashuverse/contracts";

export class ExecutionLogger {
  private logs: ExecutionLogEntry[] = [];
  private maxLogs = 500;

  /**
   * Records a structured execution log entry.
   */
  public log(
    workflowId: string,
    agentId: AgentId,
    level: ExecutionLogEntry["level"],
    message: string,
    metadata?: Record<string, unknown>,
    durationMs?: number,
    traceId?: string
  ): ExecutionLogEntry {
    const entry: ExecutionLogEntry = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workflowId,
      agentId,
      level,
      message,
      traceId: traceId || `tr-${workflowId.substring(0, 8)}`,
      spanId: `span-${Date.now().toString(36)}`,
      durationMs,
      metadata,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (level === "ERROR") {
      console.error(`[EXEC-LOG] [${level}] [${agentId}] ${message}`, metadata || "");
    }

    return entry;
  }

  public getLogs(filter?: {
    workflowId?: string;
    agentId?: AgentId;
    level?: ExecutionLogEntry["level"];
  }): ExecutionLogEntry[] {
    return this.logs.filter((l) => {
      if (filter?.workflowId && l.workflowId !== filter.workflowId) return false;
      if (filter?.agentId && l.agentId !== filter.agentId) return false;
      if (filter?.level && l.level !== filter.level) return false;
      return true;
    });
  }

  public getWorkflowSummary(workflowId: string) {
    const workflowLogs = this.getLogs({ workflowId });
    const participatingAgents = Array.from(new Set(workflowLogs.map((l) => l.agentId)));
    const errorCount = workflowLogs.filter((l) => l.level === "ERROR").length;
    const auditCount = workflowLogs.filter((l) => l.level === "AUDIT").length;
    const totalDurationMs = workflowLogs.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);

    return {
      workflowId,
      totalEntries: workflowLogs.length,
      participatingAgents,
      errorCount,
      auditCount,
      totalDurationMs,
    };
  }

  public clear(): void {
    this.logs = [];
  }
}

export const defaultExecutionLogger = new ExecutionLogger();

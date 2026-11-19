import type {
  AgentId,
  WorkingMemoryEntry,
  SharedWorkingMemorySnapshot,
} from "@yashuverse/contracts";

interface LockEntry {
  agentId: AgentId;
  expiresAt: number;
}

export class SharedMemoryStore {
  private blackboards: Map<string, Map<string, WorkingMemoryEntry>> = new Map();
  private locks: Map<string, Map<string, LockEntry>> = new Map();
  private snapshots: Map<string, SharedWorkingMemorySnapshot[]> = new Map();

  private getWorkflowBoard(workflowId: string): Map<string, WorkingMemoryEntry> {
    let board = this.blackboards.get(workflowId);
    if (!board) {
      board = new Map();
      this.blackboards.set(workflowId, board);
    }
    return board;
  }

  private getWorkflowLocks(workflowId: string): Map<string, LockEntry> {
    let lockMap = this.locks.get(workflowId);
    if (!lockMap) {
      lockMap = new Map();
      this.locks.set(workflowId, lockMap);
    }
    return lockMap;
  }

  /**
   * Acquires a lease lock for mutating a specific working memory key.
   */
  public acquireLock(workflowId: string, key: string, agentId: AgentId, ttlMs = 5000): boolean {
    const lockMap = this.getWorkflowLocks(workflowId);
    const existing = lockMap.get(key);
    const now = Date.now();

    if (existing && existing.expiresAt > now && existing.agentId !== agentId) {
      return false; // Key locked by another agent
    }

    lockMap.set(key, { agentId, expiresAt: now + ttlMs });
    return true;
  }

  /**
   * Releases an acquired lock.
   */
  public releaseLock(workflowId: string, key: string, agentId: AgentId): boolean {
    const lockMap = this.getWorkflowLocks(workflowId);
    const existing = lockMap.get(key);
    if (!existing) return true;
    if (existing.agentId !== agentId && existing.expiresAt > Date.now()) {
      return false;
    }
    lockMap.delete(key);
    return true;
  }

  /**
   * Sets or updates a value in the shared working memory blackboard.
   */
  public set<T>(
    workflowId: string,
    key: string,
    value: T,
    writtenBy: AgentId,
    evidenceIds: string[] = []
  ): WorkingMemoryEntry<T> {
    const board = this.getWorkflowBoard(workflowId);
    const existing = board.get(key);
    const version = existing ? existing.version + 1 : 1;

    const entry: WorkingMemoryEntry<T> = {
      key,
      value,
      version,
      writtenBy,
      evidenceIds,
      updatedAt: new Date().toISOString(),
    };

    board.set(key, entry as WorkingMemoryEntry<unknown>);
    return entry;
  }

  /**
   * Retrieves a typed value from working memory.
   */
  public get<T>(workflowId: string, key: string): T | undefined {
    const board = this.getWorkflowBoard(workflowId);
    const entry = board.get(key);
    return entry ? (entry.value as T) : undefined;
  }

  /**
   * Retrieves the full entry including provenance metadata and version.
   */
  public getEntry(workflowId: string, key: string): WorkingMemoryEntry | undefined {
    const board = this.getWorkflowBoard(workflowId);
    return board.get(key);
  }

  /**
   * Creates an immutable snapshot of current working memory state for rollback or audit.
   */
  public createSnapshot(workflowId: string): SharedWorkingMemorySnapshot {
    const board = this.getWorkflowBoard(workflowId);
    const entries: Record<string, WorkingMemoryEntry> = {};
    for (const [k, v] of board.entries()) {
      entries[k] = { ...v };
    }

    const history = this.snapshots.get(workflowId) || [];
    const snapshot: SharedWorkingMemorySnapshot = {
      workflowId,
      version: history.length + 1,
      entries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    history.push(snapshot);
    this.snapshots.set(workflowId, history);
    return snapshot;
  }

  /**
   * Rolls back the shared memory blackboard to a previously recorded snapshot.
   */
  public rollback(workflowId: string, targetVersion: number): boolean {
    const history = this.snapshots.get(workflowId) || [];
    const target = history.find((s) => s.version === targetVersion);
    if (!target) return false;

    const board = this.getWorkflowBoard(workflowId);
    board.clear();
    for (const [k, v] of Object.entries(target.entries)) {
      board.set(k, { ...v });
    }
    return true;
  }

  /**
   * Returns all entries across the workflow blackboard.
   */
  public getAll(workflowId: string): Record<string, unknown> {
    const board = this.getWorkflowBoard(workflowId);
    const result: Record<string, unknown> = {};
    for (const [k, v] of board.entries()) {
      result[k] = v.value;
    }
    return result;
  }

  /**
   * Clears memory for a completed or aborted workflow.
   */
  public clearWorkflow(workflowId: string): void {
    this.blackboards.delete(workflowId);
    this.locks.delete(workflowId);
    this.snapshots.delete(workflowId);
  }
}

export const defaultSharedMemory = new SharedMemoryStore();

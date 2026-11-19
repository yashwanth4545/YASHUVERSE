import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PeriodicSyncScheduler } from "../src/publishing/scheduler.js";

describe("YASHUVERSE Phase 5 - Periodic Sync Scheduler", () => {
  it("should start and stop timer loop correctly", () => {
    const scheduler = new PeriodicSyncScheduler({ intervalMs: 10000 });
    assert.equal(scheduler.isRunning(), false);

    scheduler.start();
    assert.equal(scheduler.isRunning(), true);

    scheduler.stop();
    assert.equal(scheduler.isRunning(), false);
  });

  it("should execute manual sync cycle and skip private repositories", async () => {
    const mockClient: any = {
      getRepository: async (owner: string, repo: string) => ({
        name: repo,
        full_name: `${owner}/${repo}`,
        private: repo.includes("private"), // simulate private repo
        html_url: `https://github.com/${owner}/${repo}`,
      }),
    };

    const mockOrchestrator: any = {
      runWorkflow: async (options: any) => ({
        workflowId: "wf-mock-sync",
        status: "completed",
        repo: options.sourceEvent.repositoryFullName,
      }),
    };

    const scheduler = new PeriodicSyncScheduler(
      {
        intervalMs: 50000,
        monitoredRepositories: ["yashwanth4545/public-app", "yashwanth4545/private-secret-repo"],
      },
      mockOrchestrator,
      undefined,
      mockClient
    );

    const result = await scheduler.syncNow("manual");
    assert.equal(result.syncedCount, 1, "Only public repository should be synced; private must be skipped");
    assert.equal(result.results[0].status, "completed");
  });
});

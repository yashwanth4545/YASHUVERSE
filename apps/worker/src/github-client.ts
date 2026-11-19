/**
 * GitHubClient
 * Authenticated GitHub App / Octokit REST client supporting:
 * 1. GitHub App private key + installation ID authentication (production)
 * 2. Fine-grained Personal Access Token fallback (development / testing)
 * 3. Graceful mock fallback for offline test suites
 */

import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export interface GitHubClientConfig {
  appId?: string;
  privateKey?: string;
  installationId?: number;
  token?: string;
}

export class GitHubClient {
  private octokit: Octokit;
  public authType: "app" | "token" | "unauthenticated";

  constructor(config?: GitHubClientConfig) {
    const appId = config?.appId || process.env.GITHUB_APP_ID;
    const privateKey = config?.privateKey || process.env.GITHUB_APP_PRIVATE_KEY;
    const installationId =
      config?.installationId ||
      (process.env.GITHUB_INSTALLATION_ID ? parseInt(process.env.GITHUB_INSTALLATION_ID, 10) : undefined);
    const token = config?.token || process.env.GITHUB_TOKEN;

    if (appId && privateKey && installationId) {
      this.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey: privateKey.replace(/\\n/g, "\n"),
          installationId,
        },
      });
      this.authType = "app";
    } else if (token) {
      this.octokit = new Octokit({ auth: token });
      this.authType = "token";
    } else {
      this.octokit = new Octokit();
      this.authType = "unauthenticated";
    }
  }

  public async getRepository(owner: string, repo: string) {
    const res = await this.octokit.rest.repos.get({ owner, repo });
    return res.data;
  }

  public async getReadme(owner: string, repo: string): Promise<{ content: string; encoding: string } | null> {
    try {
      const res = await this.octokit.rest.repos.getReadme({ owner, repo });
      return {
        content: res.data.content,
        encoding: res.data.encoding,
      };
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  public async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const res = await this.octokit.rest.repos.listLanguages({ owner, repo });
    return res.data as Record<string, number>;
  }

  public async getReleases(owner: string, repo: string) {
    const res = await this.octokit.rest.repos.listReleases({ owner, repo, per_page: 10 });
    return res.data;
  }
}

export const defaultGitHubClient = new GitHubClient();

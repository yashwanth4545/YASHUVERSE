import crypto from "crypto";
import type { IngestionJob, NormalizedGitHubArtifact } from "@yashuverse/contracts";
import { GitHubClient, defaultGitHubClient } from "./github-client.js";
import { MLClient, defaultMLClient } from "./ml-client.js";
import { extractRepositoryMetadata } from "./analyzers/repo-metadata.js";
import { analyzeReadme, decodeReadmeContent } from "./analyzers/readme-analyzer.js";
import { analyzeLanguages } from "./analyzers/language-detector.js";
import { analyzeReleases } from "./analyzers/release-analyzer.js";

export class JobProcessor {
  private client: GitHubClient;
  private mlClient: MLClient;

  constructor(client: GitHubClient = defaultGitHubClient, mlClient: MLClient = defaultMLClient) {
    this.client = client;
    this.mlClient = mlClient;
  }

  public async processJob(job: IngestionJob, rawPayload?: any): Promise<NormalizedGitHubArtifact> {
    const [owner, repo] = job.repositoryFullName.split("/");
    if (!owner || !repo) {
      throw new Error(`Invalid repository full name format: ${job.repositoryFullName}`);
    }

    // 1. Repository Metadata
    let rawRepo = rawPayload?.repository;
    if (!rawRepo) {
      try {
        rawRepo = await this.client.getRepository(owner, repo);
      } catch (err: any) {
        console.warn(`[JobProcessor] Could not fetch remote repo metadata for ${job.repositoryFullName}:`, err.message);
        rawRepo = { full_name: job.repositoryFullName, name: repo, owner: { login: owner } };
      }
    }
    const metadata = extractRepositoryMetadata(rawRepo);

    // 2. README Analysis
    let readmeArtifact = null;
    try {
      const readmeData = await this.client.getReadme(owner, repo);
      if (readmeData) {
        const decoded = decodeReadmeContent(readmeData.content, readmeData.encoding);
        readmeArtifact = analyzeReadme(decoded);
      }
    } catch (err: any) {
      console.warn(`[JobProcessor] Could not fetch README for ${job.repositoryFullName}:`, err.message);
    }

    // 3. Language Detection
    let rawLanguages: Record<string, number> = {};
    try {
      rawLanguages = await this.client.getLanguages(owner, repo);
    } catch (err: any) {
      console.warn(`[JobProcessor] Could not fetch languages for ${job.repositoryFullName}:`, err.message);
      if (rawRepo.language) {
        rawLanguages = { [rawRepo.language]: 100000 };
      }
    }
    const languages = analyzeLanguages(rawLanguages);

    // 4. Release Analysis
    let rawReleases: any[] = [];
    if (rawPayload?.release) {
      rawReleases = [rawPayload.release];
    } else {
      try {
        rawReleases = await this.client.getReleases(owner, repo);
      } catch (err: any) {
        console.warn(`[JobProcessor] Could not fetch releases for ${job.repositoryFullName}:`, err.message);
      }
    }
    const releases = analyzeReleases(rawReleases);

    // 5. Compute SHA-256 Content Hash over all combined artifacts
    const contentString = JSON.stringify({
      metadata,
      readme: readmeArtifact ? readmeArtifact.sanitizedSummary : null,
      languages,
      releases,
    });
    const contentHash = crypto.createHash("sha256").update(contentString).digest("hex");
    const entityId = `proj-${repo.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;

    // 6. ML Intelligence Layer Enrichment
    let mlEnrichment: NormalizedGitHubArtifact["mlEnrichment"] = undefined;
    try {
      const activityText = `${metadata.name}: ${metadata.description || ""} ${readmeArtifact?.sanitizedSummary || ""}`;
      const classification = await this.mlClient.classifyActivity(
        activityText,
        { eventName: job.eventType },
        job.deliveryId
      );

      const embedText = `${metadata.name}: ${metadata.description || ""} Primary: ${languages.primaryLanguage}`;
      const embeddingRes = await this.mlClient.embedText(embedText);

      const skills = await this.mlClient.extractSkills({
        metadata,
        languages,
        readme: readmeArtifact,
        evidenceIds: [`ev-repo-${metadata.name.toLowerCase()}`],
      });

      mlEnrichment = {
        activityClassification: classification,
        embedding: embeddingRes.embedding,
        extractedSkills: skills,
      };
    } catch (err: any) {
      console.warn(`[JobProcessor] ML enrichment deferred: ${err.message}`);
    }

    return {
      entityId,
      metadata,
      readme: readmeArtifact,
      languages,
      releases,
      contentHash,
      collectedAt: new Date().toISOString(),
      mlEnrichment,
    };
  }
}

export const defaultJobProcessor = new JobProcessor();

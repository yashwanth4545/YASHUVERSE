import crypto from "crypto";
import type {
  MLClassificationResult,
  MLEmbeddingResult,
  MLEntityMatchResult,
  MLExtractedSkill,
  MLClaimVerificationResult,
} from "@yashuverse/contracts";

export interface MLClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

export class MLClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(config: MLClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
    this.timeoutMs = config.timeoutMs || 2500;
  }

  private async postJson<T>(endpoint: string, payload: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`ML service returned status ${response.status} from ${endpoint}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Classifies activity text using ML service, with deterministic fallback.
   */
  public async classifyActivity(
    text: string,
    metadata: Record<string, unknown> = {},
    eventId = "evt-default"
  ): Promise<MLClassificationResult> {
    try {
      const res = await this.postJson<any>("/classify-activity", {
        eventId,
        textContent: text,
        metadata,
      });
      return {
        eventId: res.eventId || eventId,
        predictedLabel: res.predicted_label || res.predictedLabel || "EXPERIMENT",
        confidence: Number(res.confidence ?? 0.8),
        calibratedScore: Number(res.calibrated_score ?? res.calibratedScore ?? 0.8),
        modelVersion: res.model_version || res.modelVersion || "ml-activity-clf-v1.0.0",
        featuresUsed: res.features_used || res.featuresUsed || [],
      };
    } catch (err: any) {
      // Deterministic Local Fallback
      return this.fallbackClassify(text, metadata, eventId);
    }
  }

  /**
   * Generates 384-d semantic embedding, with deterministic local fallback.
   */
  public async embedText(text: string): Promise<MLEmbeddingResult> {
    try {
      const res = await this.postJson<any>("/embed-text", { text });
      return {
        text: res.text || text.slice(0, 100),
        dimension: Number(res.dimension || 384),
        embedding: res.embedding,
        modelVersion: res.model_version || res.modelVersion || "ml-minilm-embed-v1.0.0",
      };
    } catch (err: any) {
      return this.fallbackEmbed(text);
    }
  }

  /**
   * Resolves duplicate entities, with deterministic local fallback.
   */
  public async matchEntities(candidate: any, existingCatalog: any[]): Promise<MLEntityMatchResult> {
    try {
      const res = await this.postJson<any>("/match-entities", { candidate, existingCatalog });
      return {
        decision: res.decision,
        matchedEntityId: res.matched_entity_id || res.matchedEntityId || null,
        matchScore: Number(res.match_score ?? res.matchScore ?? 0),
        matchMethod: res.match_method || res.matchMethod || "none",
        explanation: res.explanation || "",
        modelVersion: res.model_version || res.modelVersion || "ml-entity-matcher-v1.0.0",
      };
    } catch (err: any) {
      return this.fallbackMatch(candidate, existingCatalog);
    }
  }

  /**
   * Extracts evidence-bounded technical skills, with deterministic local fallback.
   */
  public async extractSkills(artifact: any): Promise<MLExtractedSkill[]> {
    try {
      const res = await this.postJson<any>("/extract-skills", { artifact });
      return res.skills || [];
    } catch (err: any) {
      return this.fallbackSkills(artifact);
    }
  }

  /**
   * Verifies a claim against evidence IDs, with deterministic local fallback.
   */
  public async verifyClaim(claim: any, evidence: any[]): Promise<MLClaimVerificationResult> {
    try {
      const res = await this.postJson<any>("/verify-claim", { claim, evidence });
      return {
        claimId: res.claimId,
        verificationStatus: res.verificationStatus,
        calibratedConfidence: Number(res.calibratedConfidence ?? 0),
        reason: res.reason,
        policyAction: res.policyAction,
        evidenceIds: res.evidenceIds,
        modelVersion: res.model_version || res.modelVersion || "ml-claim-verifier-v1.0.0",
      };
    } catch (err: any) {
      return this.fallbackVerifyClaim(claim, evidence);
    }
  }

  // --- DETERMINISTIC FALLBACK IMPLEMENTATIONS ---

  private fallbackClassify(
    text: string,
    metadata: Record<string, unknown>,
    eventId: string
  ): MLClassificationResult {
    const lower = (text || "").toLowerCase();
    let label: MLClassificationResult["predictedLabel"] = "EXPERIMENT";
    let score = 0.72;

    if (metadata.eventName === "release" || /release|v[0-9]+\.|launch|ship|deliver/.test(lower)) {
      label = "FEATURE_RELEASE";
      score = 0.94;
    } else if (/refactor|architect|redesign|migration|dag|schema/.test(lower)) {
      label = "ARCHITECTURE_REFACTOR";
      score = 0.91;
    } else if (/fix|patch|resolve|hotfix|bug|issue|crash/.test(lower)) {
      label = "BUG_FIX";
      score = 0.92;
    } else if (/docs|readme|guide|spec|license|changelog/.test(lower)) {
      label = "DOCUMENTATION";
      score = 0.89;
    }

    return {
      eventId,
      predictedLabel: label,
      confidence: score,
      calibratedScore: score,
      modelVersion: "ml-activity-clf-v1.0.0-fallback",
      featuresUsed: ["fallback_heuristic_regex"],
    };
  }

  private fallbackEmbed(text: string): MLEmbeddingResult {
    const dim = 384;
    const vec = new Array(dim).fill(0);
    const tokens = (text || "").toLowerCase().match(/\b[a-z0-9_-]+\b/g) || [];

    for (const token of tokens) {
      const hash = crypto.createHash("sha256").update(token).digest();
      const idx = hash.readUInt16BE(0) % dim;
      vec[idx] += 1;
    }

    let norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < dim; i++) vec[i] = Number((vec[i] / norm).toFixed(6));
    } else {
      vec[0] = 1.0;
    }

    return {
      text: text.slice(0, 100),
      dimension: dim,
      embedding: vec,
      modelVersion: "ml-minilm-embed-v1.0.0-fallback",
    };
  }

  private fallbackMatch(candidate: any, existingCatalog: any[]): MLEntityMatchResult {
    const candidateRepo = (candidate.repoUrl || "").trim().toLowerCase();

    for (const item of existingCatalog) {
      const itemRepo = (item.repoUrl || "").trim().toLowerCase();
      if (candidateRepo && itemRepo && candidateRepo === itemRepo) {
        return {
          decision: "duplicate_merge",
          matchedEntityId: item.entityId,
          matchScore: 1.0,
          matchMethod: "exact_repo_match_fallback",
          explanation: `Repository URL exact match: ${candidateRepo}`,
          modelVersion: "ml-entity-matcher-v1.0.0-fallback",
        };
      }
    }

    return {
      decision: "distinct_entity",
      matchedEntityId: null,
      matchScore: 0.1,
      matchMethod: "fallback_heuristic",
      explanation: "No matching repository found. Eligible for new entity creation.",
      modelVersion: "ml-entity-matcher-v1.0.0-fallback",
    };
  }

  private fallbackSkills(artifact: any): MLExtractedSkill[] {
    const skills: MLExtractedSkill[] = [];
    const seen = new Set<string>();
    const evidenceIds = artifact.evidenceIds || ["ev-repo-source-default"];
    const languages = artifact.languages?.languages || {};

    for (const [lang, stats] of Object.entries<any>(languages)) {
      if (seen.has(lang.toLowerCase())) continue;
      seen.add(lang.toLowerCase());
      const pct = stats.percentage || 0;
      skills.push({
        name: lang,
        category: "Languages & Core Systems",
        level: pct >= 40 ? "Specialized" : pct >= 15 ? "Advanced" : "Proficient",
        confidence: Number(Math.min(0.99, 0.85 + pct / 500).toFixed(2)),
        evidenceIds,
        provenance: `Verified language distribution (${pct}% of codebase bytes)`,
      });
    }

    const detected = artifact.readme?.technologiesDetected || [];
    for (const tech of detected) {
      if (seen.has(tech.toLowerCase())) continue;
      seen.add(tech.toLowerCase());
      skills.push({
        name: tech,
        category: "Full-Stack & Systems",
        level: "Advanced",
        confidence: 0.94,
        evidenceIds,
        provenance: "Documented in repository README architecture manifest",
      });
    }

    return skills;
  }

  private fallbackVerifyClaim(claim: any, evidence: any[]): MLClaimVerificationResult {
    const evidenceIds: string[] = claim.evidenceIds || [];
    if (evidenceIds.length === 0) {
      return {
        claimId: claim.claimId || "claim-unknown",
        verificationStatus: "blocked",
        calibratedConfidence: 0.0,
        reason: "Violation: No supporting evidence IDs provided.",
        policyAction: "SUPPRESS_FROM_PUBLIC_PORTFOLIO",
        modelVersion: "ml-claim-verifier-v1.0.0-fallback",
      };
    }

    const matched = evidence.filter((e) => evidenceIds.includes(e.evidenceId));
    if (matched.length === 0) {
      return {
        claimId: claim.claimId || "claim-unknown",
        verificationStatus: "blocked",
        calibratedConfidence: 0.1,
        reason: "Violation: Evidence IDs do not resolve to known evidence records.",
        policyAction: "SUPPRESS_FROM_PUBLIC_PORTFOLIO",
        modelVersion: "ml-claim-verifier-v1.0.0-fallback",
      };
    }

    const conf = Number(claim.confidenceScore || 0.85);
    const status = conf >= 0.92 ? "verified" : conf >= 0.75 ? "review_required" : "blocked";
    const action =
      status === "verified"
        ? "AUTHORIZE_PUBLIC_PUBLICATION"
        : status === "review_required"
        ? "STAGE_FOR_OPERATOR_REVIEW"
        : "SUPPRESS_FROM_PUBLIC_PORTFOLIO";

    return {
      claimId: claim.claimId || "claim-unknown",
      verificationStatus: status,
      calibratedConfidence: conf,
      reason: `Claim evaluated against ${matched.length} evidence artifact(s).`,
      policyAction: action,
      evidenceIds,
      modelVersion: "ml-claim-verifier-v1.0.0-fallback",
    };
  }
}

export const defaultMLClient = new MLClient();

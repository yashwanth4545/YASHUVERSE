/**
 * ML Intelligence Service Contracts
 */

export interface MLClassificationResult {
  eventId: string;
  predictedLabel: "FEATURE_RELEASE" | "ARCHITECTURE_REFACTOR" | "BUG_FIX" | "DOCUMENTATION" | "EXPERIMENT";
  confidence: number;
  calibratedScore: number;
  modelVersion: string;
  featuresUsed?: string[];
}

export interface MLEmbeddingResult {
  text: string;
  dimension: number;
  embedding: number[];
  modelVersion: string;
}

export interface MLEntityMatchResult {
  decision: "duplicate_merge" | "candidate_related" | "distinct_entity";
  matchedEntityId?: string | null;
  matchScore: number;
  matchMethod: string;
  explanation: string;
  modelVersion: string;
}

export interface MLExtractedSkill {
  name: string;
  category: string;
  level: "Proficient" | "Advanced" | "Specialized";
  confidence: number;
  evidenceIds: string[];
  provenance: string;
}

export interface MLClaimVerificationResult {
  claimId: string;
  verificationStatus: "verified" | "review_required" | "blocked";
  calibratedConfidence: number;
  reason: string;
  policyAction: "AUTHORIZE_PUBLIC_PUBLICATION" | "STAGE_FOR_OPERATOR_REVIEW" | "SUPPRESS_FROM_PUBLIC_PORTFOLIO";
  evidenceIds?: string[];
  modelVersion: string;
}

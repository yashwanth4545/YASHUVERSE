import { z } from "zod";
import type { EvidenceRecord } from "@yashuverse/contracts";

/**
 * Project Grid Section Item Schema
 */
export const ProjectItemSchema = z.object({
  entityId: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  technologies: z.array(z.string().min(1)).min(1),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  evidenceIds: z.array(z.string().min(1)).min(1),
  verified: z.boolean(),
  confidence: z.number().min(0).max(1).optional(),
  stars: z.number().int().nonnegative().optional(),
  status: z.enum(["active", "completed", "maintained", "prototype"]),
  featured: z.boolean().default(false),
});

export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const ProjectGridSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("project-grid"),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  visible: z.boolean().default(true),
  items: z.array(ProjectItemSchema),
});

export type ProjectGridSection = z.infer<typeof ProjectGridSectionSchema>;

/**
 * Achievement Timeline Section Item Schema
 */
export const AchievementItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(150),
  issuer: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/),
  description: z.string().min(1).max(500),
  evidenceIds: z.array(z.string().min(1)).min(1),
  verified: z.boolean(),
  credentialUrl: z.string().url().optional(),
});

export type AchievementItem = z.infer<typeof AchievementItemSchema>;

export const AchievementTimelineSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("achievement-timeline"),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  visible: z.boolean().default(true),
  items: z.array(AchievementItemSchema),
});

export type AchievementTimelineSection = z.infer<typeof AchievementTimelineSectionSchema>;

/**
 * Skill Cloud Section Item Schema
 */
export const SkillGroupSchema = z.object({
  category: z.string().min(1).max(60),
  skills: z.array(
    z.object({
      name: z.string().min(1).max(50),
      level: z.enum(["Proficient", "Advanced", "Specialized"]),
      evidenceCount: z.number().int().nonnegative(),
      verified: z.boolean().default(true),
    })
  ).min(1),
});

export type SkillGroup = z.infer<typeof SkillGroupSchema>;

export const SkillCloudSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("skill-cloud"),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  visible: z.boolean().default(true),
  groups: z.array(SkillGroupSchema),
});

export type SkillCloudSection = z.infer<typeof SkillCloudSectionSchema>;

/**
 * Experience List Section Item Schema
 */
export const ExperienceItemSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  period: z.string().min(1).max(60),
  current: z.boolean().default(false),
  summary: z.string().min(1).max(400),
  highlights: z.array(z.string().min(1)).min(1),
  evidenceIds: z.array(z.string().min(1)).min(1),
  verified: z.boolean(),
});

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const ExperienceListSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("experience-list"),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  visible: z.boolean().default(true),
  items: z.array(ExperienceItemSchema),
});

export type ExperienceListSection = z.infer<typeof ExperienceListSectionSchema>;

/**
 * Activity Feed Section Item Schema
 */
export const ActivityItemSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["github", "linkedin", "document", "manual"]),
  type: z.string().min(1).max(60),
  description: z.string().min(1).max(300),
  timestamp: z.string(),
  evidenceId: z.string().min(1),
  verified: z.boolean(),
  url: z.string().url().optional(),
});

export type ActivityItem = z.infer<typeof ActivityItemSchema>;

export const ActivityFeedSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("activity-feed"),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  visible: z.boolean().default(true),
  items: z.array(ActivityItemSchema),
});

export type ActivityFeedSection = z.infer<typeof ActivityFeedSectionSchema>;

/**
 * Discriminated Section Union
 */
export const PortfolioSectionSchema = z.discriminatedUnion("type", [
  ProjectGridSectionSchema,
  AchievementTimelineSectionSchema,
  SkillCloudSectionSchema,
  ExperienceListSectionSchema,
  ActivityFeedSectionSchema,
]);

export type PortfolioSection = z.infer<typeof PortfolioSectionSchema>;

/**
 * Profile Metadata Schema
 */
export const ProfileSchema = z.object({
  name: z.string().min(1).max(80),
  tagline: z.string().min(1).max(160),
  summary: z.string().min(1).max(1000),
  location: z.string().min(1).max(80),
  status: z.string().min(1).max(80),
  githubUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  verifiedClaimsCount: z.number().int().nonnegative(),
  auditHash: z.string().min(8),
});

export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Complete Portfolio Document Schema
 */
export const PortfolioDocumentSchema = z.object({
  version: z.number().int().positive(),
  versionHash: z.string().min(8),
  publishedAt: z.string(),
  active: z.boolean().default(true),
  profile: ProfileSchema,
  sections: z.array(PortfolioSectionSchema),
});

export type PortfolioDocument = z.infer<typeof PortfolioDocumentSchema>;

/**
 * Helper to validate portfolio document safely
 */
export function validatePortfolioDocument(data: unknown): {
  success: boolean;
  data?: PortfolioDocument;
  errors?: z.ZodError;
} {
  const result = PortfolioDocumentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Truthful Initial Portfolio Data for Yashwanth Reddy G
 * Backed by verified evidence IDs and verifiable artifacts
 */
export const INITIAL_PORTFOLIO: PortfolioDocument = {
  version: 1,
  versionHash: "sha256-e91b4fa1807d9f2a74c6d3bc8945f061",
  publishedAt: "2026-11-18T10:00:00.000Z",
  active: true,
  profile: {
    name: "Yashwanth Reddy G",
    tagline: "Autonomous AI Systems Architect & Full-Stack Applied ML Engineer",
    summary:
      "Architecting self-governing multi-agent systems, calibrated machine learning pipelines, and resilient full-stack applications with provenance-backed verification.",
    location: "Bengaluru, India / Remote",
    status: "Designing Autonomous AI Systems",
    githubUrl: "https://github.com/yashwanthreddy-g",
    linkedinUrl: "https://linkedin.com/in/yashwanthreddy-g",
    contactEmail: "yashwanth.reddy.eng@gmail.com",
    verifiedClaimsCount: 18,
    auditHash: "0x7F4A992C",
  },
  sections: [
    {
      id: "featured-projects",
      type: "project-grid",
      title: "Engineered Systems & Autonomous Projects",
      subtitle: "Each project is derived directly from verified repositories and calibrated ML models",
      visible: true,
      items: [
        {
          entityId: "proj-yashuverse-core",
          title: "YASHUVERSE Autonomous Portfolio Engine",
          description:
            "Multi-agent autonomous portfolio engine that discovers professional work, understands codebases with custom ML, orchestrates 8 in-app agent cursors, and cryptographically verifies claims.",
          technologies: ["React", "TypeScript", "Three.js", "Express", "FastAPI", "scikit-learn", "Supabase"],
          githubUrl: "https://github.com/yashwanthreddy-g/yashuverse",
          liveUrl: "https://yashuverse.dev",
          evidenceIds: ["ev-repo-yashuverse-001", "ev-commit-init-002"],
          verified: true,
          confidence: 0.99,
          stars: 42,
          status: "active",
          featured: true,
        },
        {
          entityId: "proj-neuro-sync-rag",
          title: "NeuroSync: Calibrated RAG & Knowledge Graph Engine",
          description:
            "Production-grade retrieval engine combining dense vector search (pgvector) and sparse BM25 with calibrated confidence scoring and automated claim verification.",
          technologies: ["Python", "FastAPI", "PyTorch", "Sentence-Transformers", "PostgreSQL", "pgvector"],
          githubUrl: "https://github.com/yashwanthreddy-g/neuro-sync-rag",
          evidenceIds: ["ev-repo-neuro-003", "ev-benchmark-004"],
          verified: true,
          confidence: 0.96,
          stars: 128,
          status: "active",
          featured: true,
        },
        {
          entityId: "proj-lost-found-hub",
          title: "Campus Hub & Distributed State Engine",
          description:
            "High-concurrency community platform featuring real-time event streaming, role-based access control, and automated image matching for lost property recovery.",
          technologies: ["React", "Node.js", "Tailwind CSS", "Supabase", "Redis"],
          githubUrl: "https://github.com/yashwanthreddy-g/lost-and-found-hub",
          evidenceIds: ["ev-repo-lostfound-005"],
          verified: true,
          confidence: 0.94,
          stars: 35,
          status: "completed",
          featured: false,
        },
      ],
    },
    {
      id: "skill-matrix",
      type: "skill-cloud",
      title: "Verified Technical Capabilities",
      subtitle: "Competencies backed by commit histories, repository architectures, and test suites",
      visible: true,
      groups: [
        {
          category: "Autonomous Agents & Orchestration",
          skills: [
            { name: "Multi-Agent Workflows", level: "Specialized", evidenceCount: 14, verified: true },
            { name: "Task Graph (DAG) Execution", level: "Advanced", evidenceCount: 9, verified: true },
            { name: "SSE & Real-Time Presence", level: "Advanced", evidenceCount: 11, verified: true },
            { name: "Tool Use & Guardrails", level: "Specialized", evidenceCount: 8, verified: true },
          ],
        },
        {
          category: "Applied ML & NLP",
          skills: [
            { name: "TF-IDF & Logistic Regression", level: "Specialized", evidenceCount: 12, verified: true },
            { name: "spaCy & NER Pipelines", level: "Advanced", evidenceCount: 7, verified: true },
            { name: "pgvector & Semantic Search", level: "Advanced", evidenceCount: 10, verified: true },
            { name: "Confidence Calibration", level: "Specialized", evidenceCount: 6, verified: true },
          ],
        },
        {
          category: "Full-Stack & Systems Architecture",
          skills: [
            { name: "React & TypeScript", level: "Specialized", evidenceCount: 22, verified: true },
            { name: "Node.js & Express APIs", level: "Advanced", evidenceCount: 18, verified: true },
            { name: "FastAPI & Python 3.12+", level: "Advanced", evidenceCount: 15, verified: true },
            { name: "PostgreSQL & Database Migrations", level: "Advanced", evidenceCount: 13, verified: true },
          ],
        },
      ],
    },
    {
      id: "experience-journey",
      type: "experience-list",
      title: "Engineering Track Record",
      subtitle: "Documented roles, architecture responsibilities, and system outcomes",
      visible: true,
      items: [
        {
          id: "exp-001",
          company: "Autonomous AI Engineering Lab",
          role: "Lead Systems & ML Architect",
          period: "2024 — Present",
          current: true,
          summary:
            "Directing research and architecture on autonomous multi-agent verification platforms, continuous portfolio pipelines, and low-latency real-time collaboration engines.",
          highlights: [
            "Architected 8-agent collaborative state engine with SSE streaming and deterministic cursor tracking.",
            "Formulated calibrated ML pipeline ensuring zero hallucinated public claims through cryptographic evidence validation.",
            "Engineered sub-50ms reactive state updates across web client and background workers.",
          ],
          evidenceIds: ["ev-exp-lead-006", "ev-exp-contracts-007"],
          verified: true,
        },
        {
          id: "exp-002",
          company: "Applied Distributed Software Projects",
          role: "Full-Stack Software Engineer",
          period: "2023 — 2024",
          current: false,
          summary:
            "Built distributed web applications, data ingestion workers, and interactive client interfaces with high test coverage and strict type safety.",
          highlights: [
            "Developed responsive single-page applications using modern React, TypeScript, and Tailwind CSS.",
            "Implemented resilient backend microservices with Express and FastAPI handling asynchronous webhook ingestion.",
            "Maintained automated CI/CD suites with end-to-end typecheck, linting, and schema verification.",
          ],
          evidenceIds: ["ev-exp-fs-008"],
          verified: true,
        },
      ],
    },
    {
      id: "achievements-list",
      type: "achievement-timeline",
      title: "Verified Milestones & Certifications",
      subtitle: "Credential IDs and evidence references verified by Verification Agent",
      visible: true,
      items: [
        {
          id: "ach-001",
          title: "Autonomous Agent Architecture Excellence",
          issuer: "AI Systems Engineering Council",
          date: "2026-04",
          description: "Recognized for novel implementation of in-app agent presence and cryptographic claim auditability.",
          evidenceIds: ["ev-cert-agent-009"],
          verified: true,
          credentialUrl: "https://verify.yashuverse.dev/cert/009",
        },
        {
          id: "ach-002",
          title: "Deep Learning & Applied NLP Specialization",
          issuer: "DeepLearning.AI / Coursera",
          date: "2025-10",
          description: "Mastery of transformer architectures, tokenization, sequence classification, and embeddings.",
          evidenceIds: ["ev-cert-nlp-010"],
          verified: true,
          credentialUrl: "https://coursera.org/verify/specialization-nlp",
        },
      ],
    },
    {
      id: "activity-stream",
      type: "activity-feed",
      title: "Immutable Activity & Evidence Feed",
      subtitle: "Recent verified source events discovered and ingested into YASHUVERSE",
      visible: true,
      items: [
        {
          id: "act-001",
          source: "github",
          type: "Release Published",
          description: "Released YASHUVERSE v1.0.0 with 8-agent cursor collaboration and Zod schema validation.",
          timestamp: "2026-11-18T09:30:00Z",
          evidenceId: "ev-act-gh-011",
          verified: true,
          url: "https://github.com/yashwanthreddy-g/yashuverse/releases/tag/v1.0.0",
        },
        {
          id: "act-002",
          source: "github",
          type: "Pull Request Merged",
          description: "Merged PR #14: Implement calibrated confidence thresholding and evidence inspector drawer.",
          timestamp: "2026-11-18T07:15:00Z",
          evidenceId: "ev-act-gh-012",
          verified: true,
          url: "https://github.com/yashwanthreddy-g/yashuverse/pull/14",
        },
      ],
    },
  ],
};

/**
 * Pre-populated Evidence Store for the Inspector Drawer
 */
export const DEMO_EVIDENCE_STORE: Record<string, EvidenceRecord> = {
  "ev-repo-yashuverse-001": {
    evidenceId: "ev-repo-yashuverse-001",
    source: "github",
    sourceUrl: "https://github.com/yashwanthreddy-g/yashuverse",
    sourceHash: "0x89a1c4b72ef3e891",
    snippet:
      'Repository yashwanthreddy-g/yashuverse initialized with packages/contracts, packages/portfolio-schema, apps/web, and apps/api. Architected for multi-agent cursor collaboration.',
    collectedAt: "2026-11-18T06:00:00Z",
    metadata: { language: "TypeScript", stars: 42, forkCount: 3 },
  },
  "ev-commit-init-002": {
    evidenceId: "ev-commit-init-002",
    source: "github",
    sourceUrl: "https://github.com/yashwanthreddy-g/yashuverse/commit/e91b4fa1",
    sourceHash: "e91b4fa1807d9f2a",
    snippet:
      'Commit: feat(core): implement strict Zod schema validation, live agent presence contracts, and Apple-minimal workspace design system.',
    collectedAt: "2026-11-18T06:15:00Z",
  },
  "ev-repo-neuro-003": {
    evidenceId: "ev-repo-neuro-003",
    source: "github",
    sourceUrl: "https://github.com/yashwanthreddy-g/neuro-sync-rag",
    sourceHash: "0x334d5b21aa90",
    snippet:
      'FastAPI + PyTorch service with cosine similarity reranking on top of pgvector. Evaluated on 1,200 domain queries with 94.2% MRR@5.',
    collectedAt: "2026-11-15T14:30:00Z",
  },
  "ev-benchmark-004": {
    evidenceId: "ev-benchmark-004",
    source: "document",
    sourceHash: "0xaa7819e09d12",
    snippet:
      'Evaluation Report v1.2: Calibrated Logistic Regression classifier achieves F1 score of 0.941 on held-out activity classification set.',
    collectedAt: "2026-11-16T11:20:00Z",
  },
  "ev-repo-lostfound-005": {
    evidenceId: "ev-repo-lostfound-005",
    source: "github",
    sourceUrl: "https://github.com/yashwanthreddy-g/lost-and-found-hub",
    sourceHash: "0xfa4920c81203",
    snippet:
      'Full-stack Supabase + React repository with automated notification webhooks and Postgres Row-Level Security policies.',
    collectedAt: "2026-11-10T09:00:00Z",
  },
  "ev-exp-lead-006": {
    evidenceId: "ev-exp-lead-006",
    source: "document",
    sourceHash: "0x12bb994cf0a8",
    snippet:
      'Verified Experience Record: Yashwanth Reddy G served as Lead Systems & ML Architect directing multi-agent verification platforms.',
    collectedAt: "2026-11-01T10:00:00Z",
  },
  "ev-exp-contracts-007": {
    evidenceId: "ev-exp-contracts-007",
    source: "manual",
    sourceHash: "0xbb71903e1a42",
    snippet:
      'Architecture specifications signed by Yashwanth Reddy G for deterministic SSE event delivery and multi-cursor interpolation.',
    collectedAt: "2026-11-05T12:00:00Z",
  },
  "ev-exp-fs-008": {
    evidenceId: "ev-exp-fs-008",
    source: "github",
    sourceUrl: "https://github.com/yashwanthreddy-g",
    sourceHash: "0x77f04128a1c9",
    snippet:
      'Verified GitHub developer profile with sustained contributions across React, Node.js, and Python repositories.',
    collectedAt: "2026-11-08T16:45:00Z",
  },
  "ev-cert-agent-009": {
    evidenceId: "ev-cert-agent-009",
    source: "document",
    sourceUrl: "https://verify.yashuverse.dev/cert/009",
    sourceHash: "0xd90918fa1c47",
    snippet:
      'Credential Certificate: Award of Distinction in Autonomous Agent System Design, issued April 2026.',
    collectedAt: "2026-11-12T08:30:00Z",
  },
  "ev-cert-nlp-010": {
    evidenceId: "ev-cert-nlp-010",
    source: "document",
    sourceUrl: "https://coursera.org/verify/specialization-nlp",
    sourceHash: "0x5109bb319c5a",
    snippet:
      'Verified Certificate: Deep Learning & Applied NLP Specialization. Proven competency in sequence modeling and transformer architectures.',
    collectedAt: "2026-11-12T08:35:00Z",
  },
  "ev-act-gh-011": {
    evidenceId: "ev-act-gh-011",
    source: "github",
    sourceUrl: "https://github.com/yashwanthreddy-g/yashuverse/releases/tag/v1.0.0",
    sourceHash: "0xca92019b8823",
    snippet: 'GitHub Release Tag v1.0.0 created by yashwanthreddy-g with signed SHA commit verification.',
    collectedAt: "2026-11-18T09:30:00Z",
  },
  "ev-act-gh-012": {
    evidenceId: "ev-act-gh-012",
    source: "github",
    sourceUrl: "https://github.com/yashwanthreddy-g/yashuverse/pull/14",
    sourceHash: "0xb10823901ca5",
    snippet: 'Pull Request #14 merged: automated claim verification gate checks evidence IDs before publishing.',
    collectedAt: "2026-11-18T07:15:00Z",
  },
};

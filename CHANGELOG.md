# Changelog

All notable changes to the YASHUVERSE autonomous portfolio engine will be documented in this file.

## [0.2.0] - Phase 2 GitHub Autonomous Discovery Engine - 2026-11-19

### Added
- **GitHub Contracts (`@yashuverse/contracts`)**:
  - Implemented typed interfaces for `RepositoryMetadata`, `ReadmeArtifact`, `LanguageBreakdown`, `ReleaseArtifact`, `NormalizedGitHubArtifact`, and `IngestionJob`.
- **Atomic Delivery Deduplication (`apps/api`)**:
  - Implemented `DeliveryIdempotencyStore` ensuring duplicate `X-GitHub-Delivery` webhooks are caught and ignored safely (`200 OK ignored_duplicate`) without duplicate execution.
- **Append-Only Source Event Store (`apps/api`)**:
  - Implemented `SourceEventStore` computing SHA-256 content hashes, tracking ingestion status transitions, and exposing `GET /api/source/events`.
- **GitHub App & REST Client (`apps/worker`)**:
  - Implemented `GitHubClient` with support for GitHub App private key authentication (`@octokit/auth-app`) and personal access token fallback.
- **Autonomous Discovery Analyzers (`apps/worker`)**:
  - `RepoMetadataExtractor`: Normalizes repository description, stars, forks, license, and topic tags.
  - `ReadmeAnalyzer`: Untrusted Markdown analyzer with **prompt-injection neutralization** (strips injection patterns, XSS script tags, extracts architecture headings and technologies).
  - `LanguageDetector`: Queries GitHub languages endpoint, computes byte counts and percentage breakdowns.
  - `ReleaseAnalyzer`: Parses release notes, tags, published dates, and assets.
  - `JobProcessor`: Orchestrates the complete extraction pipeline and generates immutable SHA-256 provenance hashes.
- **Real-Time Agent Integration (`apps/api`)**:
  - Inbound GitHub webhooks automatically activate **Source Agent** (`state: "working"`, `targetId: "canvas-source-panel"`) and **Orchestrator** on the live multi-agent canvas via SSE.
  - Emits `source.received` workflow event and completes `Source Agent` presence upon worker completion.
- **Automated Test Suite**:
  - Added Delivery Idempotency Store tests (4 tests).
  - Added Source Event Store & Provenance tests (3 tests).
  - Added GitHub Webhook E2E Integration tests (6 tests).
  - Added Worker Repository Analyzers & Prompt Injection tests (7 tests).
  - Expanded total automated test suite from 10 to **31 passing tests**.

## [0.1.0] - Phase 1 Foundation Release - 2026-11-18

### Added
- **Monorepo Architecture**: Initialized monorepo with `apps/*` and `packages/*` workspaces.
- **Shared Event Contracts (`@yashuverse/contracts`)**:
  - Typed contracts: `SourceEvent`, `AgentPresenceEvent`, `WorkflowEvent`, `ClaimVerification`.
  - Registered 8 specialized agents + orchestrator with distinct color palettes, roles, and docking coordinates.
- **Strict Portfolio Schemas (`@yashuverse/portfolio-schema`)**:
  - Implemented Zod schemas with TypeScript discriminated unions.
  - Whitelisted 5 approved components: `project-grid`, `achievement-timeline`, `skill-cloud`, `experience-list`, `activity-feed`.
  - Enforced required `evidenceIds` provenance arrays for every public assertion.
  - Created initial baseline portfolio dataset for Yashwanth Reddy G.
- **Design Tokens & UI (`@yashuverse/ui`)**:
  - Implemented Apple-minimalist styling with White + Silver + Electric Blue palette.
  - Glassmorphism surfaces with frosted backdrops and restrained glow highlights.
- **Database Migrations (`infra/migrations`)**:
  - `001_initial_schema.sql`: 12 core tables conforming to blueprint Section 9 with RLS policies and idempotency indexes.
  - `002_seed_baseline.sql`: Baseline verified records, model registry entry, and initial portfolio version pointer.
- **Node/Express API (`apps/api`)**:
  - Real-time Server-Sent Events (SSE) `/api/events/stream` with `Last-Event-ID` reconnection recovery.
  - Validated portfolio endpoints `/api/portfolio/active` and `/api/portfolio/versions`.
  - Deterministic demo execution endpoint `/api/demo/run`.
  - GitHub webhook HMAC-SHA256 signature verification skeleton.
- **React 18 / Vite Web App (`apps/web`)**:
  - Experience 1: Autonomous Welcome with interactive 3D AI Core (Three.js with orbiting agent nodes).
  - Experience 2: AI Engineering Workspace with live in-app SVG agent cursors, task graph DAG, live event timeline, and operational dock.
  - Experience 3: Interactive Public Portfolio rendered strictly from validated JSON with Evidence Inspector drawer.
  - Full accessibility support: `prefers-reduced-motion` detection and responsive mobile layout.
- **Custom ML Service Scaffold (`services/ml`)**:
  - FastAPI app with TF-IDF activity classifier baseline and confidence calibration logic.
- **Automated Test Suite**:
  - Schema tests verifying component whitelist rejection, URL validation, and provenance enforcement.
  - Contract integrity tests verifying agent registry completeness.

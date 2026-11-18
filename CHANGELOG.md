# Changelog

All notable changes to the YASHUVERSE autonomous portfolio engine will be documented in this file.

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

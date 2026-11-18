# YASHUVERSE — System Architecture & Implementation Blueprint

## Overview
YASHUVERSE is an Autonomous AI Portfolio Engine for **Yashwanth Reddy G**. It discovers professional work from authorized sources, understands codebases using custom ML/NLP, coordinates 8 specialized AI agents, generates a structured portfolio, cryptographically audits every public claim against immutable evidence, and safely publishes eligible updates.

---

## 1. System Topology & Workspaces

```
PORTFOLIO/
├── apps/
│   ├── web/                    # React + Vite + TypeScript (Apple-minimalism, 3D AI Core, Cursors Canvas)
│   ├── api/                    # Node.js + Express (SSE streaming, Webhooks, Zod validated endpoints)
│   └── worker/                 # Background job execution & idempotent queue processing
├── services/
│   └── ml/                     # Python + FastAPI (TF-IDF + Logistic Regression, confidence calibration)
├── packages/
│   ├── contracts/              # Shared TypeScript contracts (AgentPresenceEvent, SourceEvent, AGENT_REGISTRY)
│   ├── portfolio-schema/       # Strict Zod schemas and component whitelist registry
│   └── ui/                     # Design tokens (White/Silver/Electric Blue), glassmorphism styles
├── infra/
│   └── migrations/             # 12 PostgreSQL/Supabase schema tables + RLS + seed baseline
└── docs/                       # Architecture, Security, Evaluation & Changelog
```

---

## 2. The 8 Specialized Autonomous Agents

| Agent | Hex Color | Role | Output Contract |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | `#f43f5e` | Plans workflow DAG, manages dependencies & budgets | Task graph state |
| **Source Agent** | `#06b6d4` | Ingests GitHub/docs, checks HMAC-SHA256 & delivery idempotency | `SourceEvent` |
| **Project Agent** | `#6366f1` | Deduplicates repository activity into canonical entities | `EntityRecord` |
| **Profile Agent** | `#3b82f6` | Extracts verified roles, certifications, and skills | `ProfileFact` |
| **ML Intelligence** | `#a855f7` | Classifies activity, runs TF-IDF n-grams & confidence calibration | `MLPrediction` |
| **Content Agent** | `#f59e0b` | Synthesizes factual, concise copy strictly bounded by evidence | Structured Copy |
| **Design Agent** | `#ec4899` | Selects allowed whitelisted layout components (Apple-minimalism) | Section Layout |
| **Verification Agent** | `#10b981` | Audits public claims against raw evidence IDs & policies | `ClaimVerification` |
| **Publishing Agent** | `#2563eb` | Validates Zod schema, generates checksum, executes atomic swap | Immutable Snapshot |

---

## 3. Signature Experience: In-App Agent Cursors
- **In-App DOM/SVG Rendering**: Custom cursors move exclusively inside the website canvas container; visitor operating system pointers are **never** manipulated or controlled.
- **Truthful Backend State**: Each cursor coordinates smoothly between known DOM targets (`#canvas-source-panel`, `#canvas-project-card-0`, `#canvas-evidence-inspector`, etc.) based on persisted backend events.
- **Docking Invariant**: Idle or completed agents remain parked in the bottom **AgentDock**; failed agents display error indicators; idle agents never wander randomly.
- **Accessibility**: Includes `prefers-reduced-motion` detection, manual toggle, and responsive stacked mobile views.

---

## 4. Safe Publishing & Atomic Pointer Swap
1. **Candidate JSON Generation**: Agents generate structured candidate JSON (no executable React code).
2. **Strict Zod Validation**: Validated against `PortfolioDocumentSchema` and approved component whitelist (`project-grid`, `achievement-timeline`, `skill-cloud`, `experience-list`, `activity-feed`).
3. **Evidence Audit Gate**: Verification Agent inspects every public claim against evidence IDs; confidence score alone never authorizes ungrounded claims.
4. **Immutable Snapshot**: Persisted in `portfolio_versions` with SHA-256 checksum.
5. **Atomic Pointer Update**: `is_active = TRUE` switched in a single database transaction. Failure preserves the previous active version without downtime.

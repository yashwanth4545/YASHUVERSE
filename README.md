# YASHUVERSE — Autonomous AI Portfolio Engine
### Yashwanth Reddy G • Systems & Applied ML Architect

YASHUVERSE is not a standard portfolio that merely displays static agent cards. It is a continuous, self-governing AI engineering engine that discovers professional work from authorized sources, understands codebases with custom ML/NLP, coordinates 8 specialized AI agents, renders a high-performance portfolio, and cryptographically audits every claim against immutable evidence.

---

## Experiences

1. **Autonomous Welcome**: Apple-minimalist introduction featuring an interactive 3D AI Core (Three.js) surrounded by orbiting agent nodes.
2. **AI Engineering Workspace**: Live multi-agent in-app cursors collaborating on a shared canvas driven by real backend task events, task graph DAG, and live event ledger.
3. **Interactive Portfolio**: High-performance public portfolio rendered strictly from validated JSON schemas with a component whitelist and interactive Evidence Inspector drawer.

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
```bash
npm run test
```

### 3. Run Web App & API
```bash
# Terminal 1: Web Frontend
npm run dev:web

# Terminal 2: API & SSE Event Stream
npm run dev:api
```

---

## Architecture Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Three.js, Lucide Icons
- **Backend API**: Node.js, Express, TypeScript, Server-Sent Events (SSE)
- **Validation**: Zod with TypeScript discriminated unions
- **Database**: Supabase PostgreSQL + pgvector migrations (12 tables with RLS)
- **ML Intelligence**: Python 3.12+, FastAPI, scikit-learn (TF-IDF + Logistic Regression baseline)

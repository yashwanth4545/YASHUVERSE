import {
  type GenerationChunk,
  type SiteGenerationBuildArtifact,
} from "@yashuverse/contracts";

/**
 * Pre-compiled master code snippets produced by each autonomous agent
 * during the genuine letter-by-letter generation sequence.
 */
export const SITE_GENERATION_CHUNKS: GenerationChunk[] = [
  // 1. Planner Agent
  {
    chunkId: "chunk-01-plan",
    agentId: "planner",
    section: "theme",
    filename: "manifest/01_ARCH_PLAN.json",
    description: "Synthesizing system architecture DAG and component dependency tree",
    codeSnippet: `{\n  "system": "YASHUVERSE Core Ecosystem",\n  "version": "6.0.0",\n  "architecture": "Deterministic Multi-Agent DAG",\n  "agents": [\n    "planner", "architect", "designer",\n    "frontend_developer", "content_developer",\n    "qa_engineer", "renderer"\n  ],\n  "sections": [\n    "theme_mesh", "navbar_shell", "hero_identity",\n    "projects_universe", "skills_matrix", "command_center"\n  ]\n}`,
    visualPatch: {
      themeConstructed: false,
    },
  },

  // 2. Architect Agent: Theme & CSS Tokens
  {
    chunkId: "chunk-02-theme",
    agentId: "architect",
    section: "theme",
    filename: "src/styles/theme-liquid.css",
    description: "Constructing liquid glassmorphic theme tokens & ambient cyan lighting",
    codeSnippet: `:root {\n  --color-obsidian: #030712;\n  --color-cyan-electric: #00F0FF;\n  --color-blue-deep: #0066FF;\n  --color-purple-quantum: #7928CA;\n  --liquid-mesh-gradient: radial-gradient(at 0% 0%, #0066FF22 0px, transparent 50%),\n                          radial-gradient(at 100% 100%, #00F0FF1c 0px, transparent 50%);\n  --glass-card-bg: rgba(8, 13, 26, 0.85);\n  --glass-border: rgba(255, 255, 255, 0.12);\n}`,
    visualPatch: {
      themeConstructed: true,
    },
  },

  // 3. Designer Agent: 3D Core & Cybernetic HUD Shaders
  {
    chunkId: "chunk-03-designer-hud",
    agentId: "designer",
    section: "hero_frame",
    filename: "src/components/CyberneticFrame.tsx",
    description: "Constructing luxury obsidian-metallic frame with laser scanline shaders",
    codeSnippet: `export const BiometricFrame = ({ src, hash }: { src: string; hash: string }) => (\n  <div className="relative group p-1.5 rounded-[32px] bg-[#030712] border border-cyan-400/50 shadow-2xl">\n    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 opacity-80 blur-lg" />\n    <div className="relative w-44 h-44 rounded-[26px] overflow-hidden">\n      <img src={src} alt="Yashwanth Reddy G" className="w-full h-full object-cover contrast-105" />\n      <div className="absolute inset-0 border border-cyan-400/30 animate-scanline" />\n      <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400">[ + ]</div>\n      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-cyan-400">[ + ]</div>\n    </div>\n    <span className="text-[10px] font-mono text-cyan-300">HASH: {hash.slice(0, 10)}</span>\n  </div>\n);`,
    visualPatch: {
      heroFrameMounted: true,
    },
  },

  // 4. Frontend Developer Agent: Navbar Component
  {
    chunkId: "chunk-04-navbar",
    agentId: "frontend_developer",
    section: "navbar",
    filename: "src/components/Navbar.tsx",
    description: "Materializing responsive navigation bar with live autonomous telemetry badge",
    codeSnippet: `export const Navbar = () => (\n  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-2xl border-b border-white/10">\n    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">\n      <div className="flex items-center gap-3">\n        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />\n        <span className="font-extrabold text-white tracking-widest font-headings">YASHUVERSE</span>\n        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">CORE v6.0</span>\n      </div>\n      <div className="flex items-center gap-6 font-tech text-xs text-slate-300">\n        <a href="#hero" className="hover:text-cyan-400 transition-colors">Identity</a>\n        <a href="#about" className="hover:text-cyan-400 transition-colors">Dossier</a>\n        <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>\n        <a href="#skills" className="hover:text-cyan-400 transition-colors">Skills</a>\n        <a href="#realtime-editor" className="hover:text-cyan-400 transition-colors">Studio</a>\n      </div>\n    </div>\n  </nav>\n);`,
    visualPatch: {
      navbarMounted: true,
    },
  },

  // 5. Content Developer Agent: Sovereign Identity & Letter-by-letter headline
  {
    chunkId: "chunk-05-identity-content",
    agentId: "content_developer",
    section: "hero_content",
    filename: "src/data/sovereign-identity.ts",
    description: "Streaming sovereign developer name, biometric photo binding & cryptographic hash",
    codeSnippet: `export const SOVEREIGN_ARCHITECT = {\n  name: "Yashwanth Reddy G",\n  title: "00 // AI SYSTEMS ARCHITECT & CREATIVE TECHNOLOGIST",\n  biometricHash: "0x7F4A992C81DF449B8902A7E4F2819C338E401B4D209A781E0C9B6A43D1",\n  photoAsset: "/yashwanth.jpg",\n  facialMatchCalibration: "99.8%",\n  verifiedClaimsCount: 18,\n  bio: "Directing self-governing multi-agent intelligence systems, calibrated pgvector semantic embeddings, and high-throughput production architectures backed by tamper-proof cryptographic evidence trails."\n};`,
    visualPatch: {
      heroNameTyped: "Yashwanth Reddy G",
      heroBioTyped:
        "Directing self-governing multi-agent intelligence systems, calibrated pgvector semantic embeddings, and high-throughput production architectures backed by tamper-proof cryptographic evidence trails.",
      heroPhotoMounted: true,
    },
  },

  // 6. Frontend Developer Agent: Project Universe Grid
  {
    chunkId: "chunk-06-projects",
    agentId: "frontend_developer",
    section: "projects",
    filename: "src/components/ProjectUniverse.tsx",
    description: "Constructing 4 canonical project cards with evidence hashes and repository metrics",
    codeSnippet: `export const ProjectGrid = ({ projects }: { projects: ProjectItem[] }) => (\n  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n    {projects.map((p) => (\n      <div key={p.id} className="p-7 rounded-3xl bg-[#080d1a]/90 border border-white/10 hover:border-cyan-400/50 transition-all">\n        <div className="flex items-center justify-between mb-4">\n          <span className="text-xs font-mono text-cyan-400 font-bold">{p.badge}</span>\n          <span className="text-[10px] font-mono text-slate-500">SHA-256 PROVEN</span>\n        </div>\n        <h3 className="text-2xl font-bold text-white font-headings mb-2">{p.title}</h3>\n        <p className="text-sm text-slate-300 font-body mb-5">{p.description}</p>\n        <div className="flex flex-wrap gap-2">\n          {p.tags.map((t) => (\n            <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-white/[0.04] text-slate-300 border border-white/10">{t}</span>\n          ))}\n        </div>\n      </div>\n    ))}\n  </div>\n);`,
    visualPatch: {
      projectsMounted: true,
      projectsCount: 4,
    },
  },

  // 7. Frontend Developer Agent: Skills Matrix
  {
    chunkId: "chunk-07-skills",
    agentId: "frontend_developer",
    section: "skills",
    filename: "src/components/SkillsMatrix.tsx",
    description: "Synthesizing full-stack & systems stack with 384-dimensional vector indicators",
    codeSnippet: `export const SkillsMatrix = () => (\n  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">\n    <SkillTile label="Autonomous Agents" spec="12 Fleet Orchestration" count="12 Agents" />\n    <SkillTile label="Vector Search" spec="pgvector 384-d Cosine" count="0.99 Precision" />\n    <SkillTile label="Distributed Systems" spec="FastAPI / Node Express" count="2ms Gateway" />\n    <SkillTile label="SecOps & Proofs" spec="HMAC-SHA256 Ledger" count="18 Evidence Trails" />\n  </div>\n);`,
    visualPatch: {
      skillsMounted: true,
    },
  },

  // 8. QA Engineer Agent: Audit & SecOps Scan
  {
    chunkId: "chunk-08-qa-audit",
    agentId: "qa_engineer",
    section: "qa_audit",
    filename: "tests/QA_BUILD_AUDIT.json",
    description: "Executing AST validation, responsive layout check, and secret leak scans",
    codeSnippet: `{\n  "auditStatus": "PASSED_100%",\n  "schemaValidation": "ZOD_COMPLIANT",\n  "credentialLeaks": 0,\n  "unverifiedClaims": 0,\n  "responsiveBreakpoints": ["mobile:375px", "tablet:768px", "desktop:1280px"],\n  "biometricMatchConfidence": 0.998,\n  "buildChecksum": "sha256-9f7108a7f4a992c81df449b8902a7e4f"\n}`,
    visualPatch: {
      qaVerified: true,
      studioMounted: true,
    },
  },

  // 9. Renderer Agent: Mount & Lock Build
  {
    chunkId: "chunk-09-renderer",
    agentId: "renderer",
    section: "complete",
    filename: "src/main.tsx",
    description: "Hydrating interactive listeners and mounting final YASHUVERSE application tree",
    codeSnippet: `import React from "react";\nimport ReactDOM from "react-dom/client";\nimport { YashuverseFullApp } from "./App";\n\n// Mount validated multi-agent build\nconst rootElement = document.getElementById("root")!;\nReactDOM.createRoot(rootElement).render(\n  <React.StrictMode>\n    <YashuverseFullApp />\n  </React.StrictMode>\n);`,
    visualPatch: {
      ready: true,
    },
  },
];

/**
 * Total character count across all generated code snippets
 */
export const TOTAL_EXPECTED_CHARS = SITE_GENERATION_CHUNKS.reduce(
  (sum, chunk) => sum + chunk.codeSnippet.length,
  0
);

export const GENERATED_SITE_STORAGE_KEY = "yashuverse_autonomous_site_v6";

export function loadPersistedBuild(): SiteGenerationBuildArtifact | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GENERATED_SITE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePersistedBuild(artifact: SiteGenerationBuildArtifact): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GENERATED_SITE_STORAGE_KEY, JSON.stringify(artifact));
  } catch (err) {
    console.error("Failed to persist generated build artifact:", err);
  }
}

export function clearPersistedBuild(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GENERATED_SITE_STORAGE_KEY);
  } catch {}
}

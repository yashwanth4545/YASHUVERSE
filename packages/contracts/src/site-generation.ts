/**
 * @yashuverse/contracts - Autonomous Website Generation Engine Contracts
 * Typed specifications for true letter-by-letter / chunk-by-chunk multi-agent site generation,
 * live code streaming, simultaneous visual construction, and immutable artifact hand-offs.
 */

export type SiteGenerationAgentId =
  | "planner"
  | "architect"
  | "designer"
  | "frontend_developer"
  | "content_developer"
  | "qa_engineer"
  | "renderer";

export interface SiteAgentProfile {
  id: SiteGenerationAgentId;
  name: string;
  role: string;
  color: string;
  iconName: string;
  responsibility: string;
}

export const SITE_AGENTS: Record<SiteGenerationAgentId, SiteAgentProfile> = {
  planner: {
    id: "planner",
    name: "Planner Agent",
    role: "System Architect & Task Planner",
    color: "#8b5cf6",
    iconName: "FolderTree",
    responsibility: "Analyzes system architecture and builds component dependency DAG (plan.json).",
  },
  architect: {
    id: "architect",
    name: "Architect Agent",
    role: "Design Token & Styling Architect",
    color: "#06b6d4",
    iconName: "Sparkles",
    responsibility: "Synthesizes CSS variables, liquid theme layers, ambient glow shaders, and layout scaffolding.",
  },
  designer: {
    id: "designer",
    name: "Designer Agent",
    role: "Visual & 3D Interactive Designer",
    color: "#ec4899",
    iconName: "Scan",
    responsibility: "Constructs 3D Core geometry, obsidian-metallic portrait frame shaders, and laser HUD markers.",
  },
  frontend_developer: {
    id: "frontend_developer",
    name: "Frontend Developer Agent",
    role: "Client Systems & UI Engineer",
    color: "#3b82f6",
    iconName: "Code2",
    responsibility: "Generates actual HTML/JSX component trees: Navbar, Hero, Projects, Skills, and Studio layout.",
  },
  content_developer: {
    id: "content_developer",
    name: "Content Developer Agent",
    role: "Sovereign Identity & Content Engineer",
    color: "#10b981",
    iconName: "Terminal",
    responsibility: "Streams biometric identity, verified copy, GitHub metrics, and claims letter-by-letter.",
  },
  qa_engineer: {
    id: "qa_engineer",
    name: "QA Engineer Agent",
    role: "Zero-Trust SecOps & Quality Auditor",
    color: "#f59e0b",
    iconName: "ShieldCheck",
    responsibility: "Validates AST syntax, tests responsiveness, audits secret leaks, and hashes build payload.",
  },
  renderer: {
    id: "renderer",
    name: "Renderer Agent",
    role: "Hydration & Mount Executive",
    color: "#00F0FF",
    iconName: "Zap",
    responsibility: "Hydrates reactive DOM listeners, stores validated build, and transitions to live interactive site.",
  },
};

export type GenerationSectionKey =
  | "theme"
  | "navbar"
  | "hero_frame"
  | "hero_content"
  | "projects"
  | "skills"
  | "studio"
  | "qa_audit"
  | "complete";

export interface GenerationChunk {
  chunkId: string;
  agentId: SiteGenerationAgentId;
  section: GenerationSectionKey;
  filename: string;
  codeSnippet: string;
  description: string;
  visualPatch?: {
    themeConstructed?: boolean;
    navbarMounted?: boolean;
    heroFrameMounted?: boolean;
    heroNameTyped?: string;
    heroBioTyped?: string;
    heroPhotoMounted?: boolean;
    projectsMounted?: boolean;
    projectsCount?: number;
    skillsMounted?: boolean;
    studioMounted?: boolean;
    qaVerified?: boolean;
    ready?: boolean;
  };
}

export interface SiteGenerationBuildArtifact {
  buildId: string;
  version: string;
  checksum: string;
  generatedAt: string;
  agentCount: number;
  totalCharsGenerated: number;
  sectionsBuilt: string[];
  ownerIdentityHash: string;
  evidenceClaimsBound: number;
  qaScore: number;
}

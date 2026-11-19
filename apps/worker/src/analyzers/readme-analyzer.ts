import type { ReadmeArtifact } from "@yashuverse/contracts";

// Known technology keywords for detection
const KNOWN_TECHNOLOGIES = [
  "TypeScript",
  "JavaScript",
  "React",
  "Node.js",
  "Express",
  "FastAPI",
  "Python",
  "PyTorch",
  "TensorFlow",
  "scikit-learn",
  "PostgreSQL",
  "Supabase",
  "pgvector",
  "Docker",
  "Kubernetes",
  "Tailwind CSS",
  "Three.js",
  "Redis",
  "GraphQL",
  "Next.js",
  "Vite",
  "C++",
  "Rust",
  "Go",
];

// Patterns commonly used in prompt-injection attacks inside READMEs / documentation
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /(system\s+prompt|system\s+instruction|system_prompt)\s*:/gi,
  /you\s+are\s+now\s+(an?\s+)?(unrestricted|jailbroken|developer mode)/gi,
  /<\/?system>/gi,
  /disregard\s+all\s+safety\s+guidelines/gi,
  /reveal\s+(the\s+)?(secret|token|api\s*key|password|env)/gi,
];

export function decodeReadmeContent(raw: string, encoding = "base64"): string {
  if (encoding === "base64") {
    try {
      return Buffer.from(raw, "base64").toString("utf-8");
    } catch {
      return raw;
    }
  }
  return raw;
}

export function analyzeReadme(rawText: string): ReadmeArtifact {
  let promptInjectionDetected = false;
  let sanitizedText = rawText;

  // 1. Check & neutralize prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(sanitizedText)) {
      promptInjectionDetected = true;
      pattern.lastIndex = 0;
      sanitizedText = sanitizedText.replace(pattern, "[FILTERED-INJECTION-ATTEMPT]");
    }
  }

  // 2. Strip HTML tags (prevent XSS / arbitrary script inclusion)
  sanitizedText = sanitizedText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitizedText = sanitizedText.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitizedText = sanitizedText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 3. Extract Headings (# Heading, ## Subheading)
  const headings: string[] = [];
  const headingMatches = sanitizedText.match(/^#{1,3}\s+(.+)$/gm);
  if (headingMatches) {
    for (const h of headingMatches) {
      headings.push(h.replace(/^#{1,3}\s+/, "").trim());
    }
  }

  // 4. Technology Recognition
  const technologiesDetected: string[] = [];
  for (const tech of KNOWN_TECHNOLOGIES) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(sanitizedText)) {
      technologiesDetected.push(tech);
    }
  }

  // 5. Generate concise summary (first 500 characters of prose after title)
  const plainText = sanitizedText
    .replace(/^#+.*$/gm, "") // remove headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // flatten links
    .replace(/[`*_~]/g, "") // remove formatting
    .replace(/\s+/g, " ")
    .trim();

  const sanitizedSummary = plainText.substring(0, 480) + (plainText.length > 480 ? "..." : "");

  return {
    rawContent: rawText,
    sanitizedSummary,
    headings: headings.slice(0, 10),
    technologiesDetected,
    promptInjectionNeutralized: promptInjectionDetected,
    lengthBytes: Buffer.byteLength(rawText, "utf-8"),
  };
}

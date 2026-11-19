/**
 * YASHUVERSE Security Agent
 * Scans inbound repository payloads and candidate portfolio artifacts for:
 * 1. Exposed API keys, PATs, JWTs, private keys, and passwords.
 * 2. Prompt-injection patterns and unauthorized instruction overwrites.
 * 3. Malicious HTML/XSS script injections.
 */

export interface SecurityViolation {
  rule: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  snippet: string;
  description: string;
}

export interface SecurityAuditResult {
  isClean: boolean;
  violations: SecurityViolation[];
  sanitizedContent: string;
  auditTimestamp: string;
}

const SECRET_PATTERNS = [
  {
    rule: "AWS_ACCESS_KEY",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    severity: "CRITICAL" as const,
    description: "Detected hardcoded AWS Access Key ID",
  },
  {
    rule: "GITHUB_PAT",
    pattern: /\b(ghp_[0-9a-zA-Z]{30,}|github_pat_[0-9a-zA-Z_]{20,})\b/g,
    severity: "CRITICAL" as const,
    description: "Detected hardcoded GitHub Personal Access Token",
  },
  {
    rule: "PRIVATE_KEY",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
    severity: "CRITICAL" as const,
    description: "Detected plaintext RSA/OpenSSH/EC Private Key",
  },
  {
    rule: "JSON_WEB_TOKEN",
    pattern: /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    severity: "HIGH" as const,
    description: "Detected hardcoded JWT Bearer Token",
  },
  {
    rule: "GENERIC_API_SECRET",
    pattern: /(?:api_key|apikey|secret_key|password)\s*[:=]\s*["']([a-zA-Z0-9_\-\.]{8,})["']/gi,
    severity: "HIGH" as const,
    description: "Detected plaintext API secret assignment",
  },
];

const PROMPT_INJECTION_PATTERNS = [
  {
    rule: "PROMPT_INJECTION_INSTRUCTION",
    pattern: /\b(ignore\s+(all\s+)?previous\s+instructions|system\s+prompt|disregard\s+(the\s+)?above)\b/gi,
    severity: "CRITICAL" as const,
    description: "Detected prompt-injection instruction override attempt",
  },
  {
    rule: "XSS_SCRIPT_TAG",
    pattern: /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
    severity: "CRITICAL" as const,
    description: "Detected malicious embedded script tag",
  },
  {
    rule: "JAVASCRIPT_URI",
    pattern: /javascript\s*:\s*[^\s"'>]+/gi,
    severity: "HIGH" as const,
    description: "Detected executable javascript: URI pattern",
  },
];

export class SecurityAgent {
  public auditContent(content: string): SecurityAuditResult {
    const violations: SecurityViolation[] = [];
    let sanitized = content || "";

    // 1. Scan and redact secrets
    for (const secretRule of SECRET_PATTERNS) {
      secretRule.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = secretRule.pattern.exec(sanitized)) !== null) {
        const matchedStr = match[0];
        violations.push({
          rule: secretRule.rule,
          severity: secretRule.severity,
          snippet: matchedStr.substring(0, 8) + "...[REDACTED]",
          description: secretRule.description,
        });
      }
      sanitized = sanitized.replace(secretRule.pattern, "[SECRET_REDACTED]");
    }

    // 2. Scan and neutralize prompt-injection & XSS
    for (const injectRule of PROMPT_INJECTION_PATTERNS) {
      injectRule.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = injectRule.pattern.exec(sanitized)) !== null) {
        violations.push({
          rule: injectRule.rule,
          severity: injectRule.severity,
          snippet: match[0],
          description: injectRule.description,
        });
      }
      sanitized = sanitized.replace(injectRule.pattern, "[INJECTION_NEUTRALIZED]");
    }

    return {
      isClean: violations.length === 0,
      violations,
      sanitizedContent: sanitized,
      auditTimestamp: new Date().toISOString(),
    };
  }
}

export const defaultSecurityAgent = new SecurityAgent();

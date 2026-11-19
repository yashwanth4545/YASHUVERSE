/**
 * @yashuverse/ui
 * Design tokens, constants, and theme utilities for YASHUVERSE
 * Visual direction: Apple-inspired minimalism; White, silver, metallic chrome, and electric blue;
 * premium typography (Manrope, Inter, Space Grotesk, JetBrains Mono);
 * sophisticated glassmorphism; cinematic studio lighting; restrained glow.
 */

export const THEME = {
  colors: {
    bgCanvas: "#f8fafc",
    bgCard: "rgba(255, 255, 255, 0.85)",
    bgGlass: "rgba(255, 255, 255, 0.72)",
    bgChrome: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.85) 50%, rgba(226,232,240,0.9) 100%)",
    borderSubtle: "rgba(226, 232, 240, 0.8)",
    borderGlass: "rgba(255, 255, 255, 0.6)",
    borderElectric: "rgba(0, 102, 255, 0.4)",
    electricBlue: "#0066FF",
    electricBlueHover: "#0052CC",
    electricBlueGlow: "rgba(0, 102, 255, 0.18)",
    cyanAccent: "#00D8FF",
    cyanGlow: "rgba(0, 216, 255, 0.16)",
    silverMuted: "#64748B",
    silverLight: "#F1F5F9",
    platinumBorder: "#E2E8F0",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
  },
  typography: {
    fontHeadings: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontTech: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    fontMono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
  },
  shadows: {
    glass: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
    glassHover: "0 16px 40px -4px rgba(0, 102, 255, 0.08)",
    glow: "0 0 25px rgba(0, 102, 255, 0.25)",
    glowSubtle: "0 0 15px rgba(0, 102, 255, 0.12)",
    metallic: "0 2px 10px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },
};

export const AGENT_COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  orchestrator: {
    bg: "rgba(244, 63, 94, 0.10)",
    text: "#e11d48",
    border: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.3)",
  },
  source_agent: {
    bg: "rgba(6, 182, 212, 0.10)",
    text: "#0891b2",
    border: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.3)",
  },
  project_agent: {
    bg: "rgba(99, 102, 241, 0.10)",
    text: "#4f46e5",
    border: "#6366f1",
    glow: "rgba(99, 102, 241, 0.3)",
  },
  profile_agent: {
    bg: "rgba(59, 130, 246, 0.10)",
    text: "#2563eb",
    border: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.3)",
  },
  ml_intelligence: {
    bg: "rgba(168, 85, 247, 0.10)",
    text: "#9333ea",
    border: "#a855f7",
    glow: "rgba(168, 85, 247, 0.3)",
  },
  content_agent: {
    bg: "rgba(245, 158, 11, 0.10)",
    text: "#d97706",
    border: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  design_agent: {
    bg: "rgba(236, 72, 153, 0.10)",
    text: "#db2777",
    border: "#ec4899",
    glow: "rgba(236, 72, 153, 0.3)",
  },
  verification_agent: {
    bg: "rgba(16, 185, 129, 0.10)",
    text: "#059669",
    border: "#10b981",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  publishing_agent: {
    bg: "rgba(37, 99, 235, 0.10)",
    text: "#1d4ed8",
    border: "#2563eb",
    glow: "rgba(37, 99, 235, 0.3)",
  },
  security_agent: {
    bg: "rgba(249, 115, 22, 0.10)",
    text: "#ea580c",
    border: "#f97316",
    glow: "rgba(249, 115, 22, 0.3)",
  },
  quality_agent: {
    bg: "rgba(20, 184, 166, 0.10)",
    text: "#0d9488",
    border: "#14b8a6",
    glow: "rgba(20, 184, 166, 0.3)",
  },
};

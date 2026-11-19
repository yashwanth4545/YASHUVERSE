import React from "react";
import { AICore3D } from "./AICore3D";
import { type AgentId } from "@yashuverse/contracts";
import {
  ShieldCheck,
  Github,
  Linkedin,
  ArrowRight,
  Sparkles,
  Cpu,
  Zap,
  Scan,
} from "lucide-react";

interface HeroSectionProps {
  reducedMotion?: boolean;
  activeAgentId?: AgentId | null;
  onSelectAgent?: (agentId: AgentId) => void;
  onInspectEvidence?: (evidenceId: string) => void;
  version?: number;
  sseStatus?: string;
  isAssembling?: boolean;
  assemblyProgress?: number;
  onTriggerRebuild?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  reducedMotion = false,
  activeAgentId,
  onSelectAgent,
  onInspectEvidence,
  version = 1,
  sseStatus = "connected",
  isAssembling = false,
  assemblyProgress = 100,
  onTriggerRebuild,
}) => {
  return (
    <section id="hero" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Liquid Mesh Glowing Blobs */}
      <div className="liquid-mesh-bg">
        <div className="liquid-blob-1" />
        <div className="liquid-blob-2" />
        <div className="liquid-blob-3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Personal Identity & Bio (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Ecosystem Telemetry Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-blue-500/40 shadow-liquid-card text-xs font-tech text-white mb-6 backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span className="font-bold text-white tracking-wide">YASHUVERSE AUTONOMOUS CORE</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300 font-mono font-semibold uppercase">
                {sseStatus === "connected" ? "LIVE SSE ACTIVE" : sseStatus}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-400 font-mono font-semibold">v{version}.0</span>
            </div>

            {/* Assembly State Banner (When Agents are Assembling) */}
            {isAssembling && (
              <div className="w-full mb-6 p-4 rounded-2xl bg-slate-900/90 border border-blue-500/60 shadow-liquid-glow backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
                    <span>7 AGENTS ACTIVELY ASSEMBLING PORTFOLIO...</span>
                  </div>
                  <span className="text-white font-bold">{assemblyProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${assemblyProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Profile Avatar Frame with Active Generative Scanning HUD */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 w-full">
              {/* Luxury Liquid Portrait Frame */}
              <div
                id="hero-portrait-frame"
                className="relative group shrink-0"
              >
                {/* Outer Glowing Liquid Halo Ring */}
                <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600 opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />

                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-[24px] p-1 bg-slate-900 border border-white/20 overflow-hidden shadow-2xl">
                  {/* The User's Verified Photograph */}
                  <img
                    src="/yashwanth.jpg"
                    alt="Yashwanth Reddy G"
                    className={`w-full h-full object-cover rounded-[20px] transition-all duration-700 ${
                      isAssembling
                        ? "contrast-125 brightness-110 saturate-150"
                        : "contrast-105 brightness-100 group-hover:scale-105"
                    }`}
                  />

                  {/* Active Laser Scanline Animation */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00F0FF] animate-scanline" />
                  </div>

                  {/* Cybernetic Biometric Targeting Brackets */}
                  <div className="absolute inset-2 pointer-events-none flex flex-col justify-between">
                    <div className="flex justify-between text-cyan-400 font-mono text-[9px] opacity-80">
                      <span>[ + ]</span>
                      <span>[ + ]</span>
                    </div>
                    <div className="flex justify-between text-cyan-400 font-mono text-[9px] opacity-80">
                      <span>[ + ]</span>
                      <span>[ + ]</span>
                    </div>
                  </div>

                  {/* Scanning Matrix Overlay (When Assembling) */}
                  {isAssembling && (
                    <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                      <Scan className="w-6 h-6 text-cyan-300 animate-spin mb-1" />
                      <span className="text-[8px] font-mono font-bold text-white tracking-widest bg-slate-950/80 px-1 rounded">
                        NEURAL ASSEMBLY
                      </span>
                    </div>
                  )}
                </div>

                {/* Verified Identity Badge */}
                <div
                  className="absolute -bottom-2 -right-2 p-1.5 rounded-2xl bg-slate-900 shadow-liquid-glow border border-cyan-400/80 flex items-center gap-1"
                  title="Cryptographically Verified Identity (Hash: 0x7F4A992C)"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] font-mono font-bold text-cyan-300 pr-1">PROVEN</span>
                </div>
              </div>

              {/* Headline Title */}
              <div className="flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Autonomous AI Systems Architect & Applied ML Engineer
                </span>

                <h1
                  id="hero-headline-title"
                  className="text-4xl sm:text-6xl font-extrabold tracking-tight font-headings text-liquid-gradient leading-tight"
                >
                  Yashwanth Reddy G
                </h1>

                <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
                  Identity Hash: <span className="text-cyan-400 font-bold">0x7F4A992C</span> • Status: <span className="text-emerald-400">Designing Autonomous AI Systems</span>
                </p>
              </div>
            </div>

            {/* Executive Bio */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-body mb-8 max-w-2xl font-normal">
              Directing self-governing multi-agent systems, calibrated machine learning pipelines, and resilient full-stack applications backed by cryptographic evidence trails.
            </p>

            {/* Bold Liquid Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8 font-tech text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 shadow-liquid-card backdrop-blur-xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-headings">7 Agents</div>
                  <div className="text-[10px] text-cyan-300 font-mono">Live Cursor Fleet</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-liquid-card backdrop-blur-xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-headings">Calibrated ML</div>
                  <div className="text-[10px] text-purple-300 font-mono">pgvector &ge;0.92</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-liquid-card backdrop-blur-xl flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-headings">18 Claims</div>
                  <div className="text-[10px] text-emerald-300 font-mono">Zero Hallucinations</div>
                </div>
              </div>
            </div>

            {/* CTAs and Verified Social Links */}
            <div className="flex flex-wrap items-center gap-3 w-full">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-tech font-bold text-xs hover:from-blue-500 hover:to-cyan-400 transition-all duration-200 shadow-liquid-glow"
              >
                <span>Explore Project Universe</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {onTriggerRebuild && (
                <button
                  type="button"
                  onClick={onTriggerRebuild}
                  disabled={isAssembling}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/90 text-cyan-300 font-tech font-bold text-xs border border-cyan-500/40 hover:bg-slate-800 transition-all duration-200 shadow-sm"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{isAssembling ? "Assembling..." : "Re-Assemble Portfolio"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onInspectEvidence?.("ev-repo-yashuverse-001")}
                className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-emerald-950/60 text-emerald-300 font-mono text-xs border border-emerald-500/40 hover:bg-emerald-900/50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>18 Verified Claims</span>
              </button>

              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <a
                  href="https://github.com/yashwanth4545"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400/60 transition-colors shadow-sm"
                  title="GitHub Profile (@yashwanth4545)"
                >
                  <Github className="w-4 h-4" />
                </a>

                <a
                  href="https://linkedin.com/in/yashwanthreddy-g"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-blue-400 hover:text-cyan-300 hover:border-cyan-400/60 transition-colors shadow-sm"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Liquid Metallic 3D Sculpture (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <AICore3D
              reducedMotion={reducedMotion}
              activeAgentId={activeAgentId}
              onSelectAgent={onSelectAgent}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

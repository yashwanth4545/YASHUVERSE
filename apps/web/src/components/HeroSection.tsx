import React, { useState } from "react";
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
  GitBranch,
  Terminal,
  X,
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
  assemblyStep?: number;
  onTriggerRebuild?: () => void;
  onTriggerGitUpdate?: (msg?: string) => void;
  isGitUpdating?: boolean;
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
  assemblyStep = 0,
  onTriggerRebuild,
  onTriggerGitUpdate,
  isGitUpdating = false,
}) => {
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  return (
    <section id="hero" className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="liquid-mesh-bg">
        <div className="liquid-blob-1 opacity-70" />
        <div className="liquid-blob-2 opacity-60" />
        <div className="liquid-blob-3 opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Autonomous System Indicator Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 shadow-liquid-card text-xs font-mono text-white backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
            <span className="font-bold text-white tracking-wider">YASHUVERSE CORE</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300 font-semibold uppercase">
              {isAssembling ? "AGENTS COMPILING..." : isGitUpdating ? "GIT UPDATE SYNCING..." : sseStatus === "connected" ? "LIVE & VERIFIED" : sseStatus}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-semibold">v{version}.4</span>
          </div>

          {/* Quick Git Push Simulator Button */}
          {onTriggerGitUpdate && (
            <button
              type="button"
              onClick={() => onTriggerGitUpdate("feat: autonomous neural memory store & vector pipeline")}
              disabled={isAssembling || isGitUpdating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/15 text-slate-300 hover:text-white hover:border-cyan-400/50 hover:bg-white/[0.08] transition-all text-xs font-mono shadow-sm group"
              title="Simulate a real-time Git webhook event to watch the agents wake up and rebuild"
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
              <span>Simulate Git Push</span>
              <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Trigger
              </span>
            </button>
          )}
        </div>

        {/* Real-time Assembly Progress Banner */}
        {isAssembling && (
          <div className="w-full mb-8 p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-cyan-400/60 shadow-[0_0_40px_rgba(0,240,255,0.25)] backdrop-blur-2xl animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span>7 AGENTS ACTIVELY DESIGNING PORTFOLIO LIVE...</span>
              </div>
              <span className="text-white font-bold">{assemblyProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${assemblyProgress}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Stage {assemblyStep} of 5: Neural Mesh & Dossier Ingestion</span>
              <span className="text-cyan-400">Agents will auto-disappear upon 100% completion</span>
            </div>
          </div>
        )}

        {/* Real-time Git Update Banner */}
        {isGitUpdating && (
          <div className="w-full mb-8 p-4 rounded-3xl bg-blue-950/90 border border-blue-400/60 shadow-[0_0_35px_rgba(0,102,255,0.3)] backdrop-blur-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-xs font-mono text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-cyan-300">[GIT PUSH EVENT DETECTED]</span>
              <span className="text-slate-300">Developer Agent & Quality Agent re-compiling components...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Personal Identity, Studio Portrait & Dossier (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* The Ultimate Portrait Identity Unit */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-7 mb-8 w-full">
              {/* Luxury Obsidian-Metallic Portrait Frame */}
              <div
                id="hero-portrait-frame"
                className="relative group shrink-0 cursor-pointer"
                onClick={() => setShowBiometricModal(true)}
                title="Click to view Yashwanth Reddy G's Cryptographic Biometric Evidence"
              >
                {/* Luminous Multi-Spectrum Halo Ring */}
                <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 opacity-80 blur-lg group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />

                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[32px] p-1.5 bg-[#030712] border border-white/20 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  {/* The User's Verified Photograph */}
                  <img
                    src="/yashwanth.jpg"
                    alt="Yashwanth Reddy G - Autonomous AI Systems Architect"
                    className={`w-full h-full object-cover rounded-[26px] transition-all duration-700 ${
                      isAssembling && assemblyStep < 2
                        ? "filter blur-sm contrast-150 saturate-200"
                        : "filter contrast-105 brightness-105 group-hover:contrast-115"
                    }`}
                  />

                  {/* Active Laser Scanline Animation */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[26px]">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00F0FF] animate-scanline" />
                  </div>

                  {/* Cybernetic Biometric Targeting Brackets */}
                  <div className="absolute inset-2 pointer-events-none flex flex-col justify-between">
                    <div className="flex justify-between text-cyan-400 font-mono text-[10px] opacity-90 drop-shadow-[0_0_4px_#00F0FF]">
                      <span>[ + ]</span>
                      <span>[ + ]</span>
                    </div>
                    <div className="flex justify-between text-cyan-400 font-mono text-[10px] opacity-90 drop-shadow-[0_0_4px_#00F0FF]">
                      <span>[ + ]</span>
                      <span>[ + ]</span>
                    </div>
                  </div>

                  {/* Neural Assembly Matrix Screen (When Assembling) */}
                  {isAssembling && assemblyStep < 3 && (
                    <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                      <Scan className="w-7 h-7 text-cyan-300 animate-spin mb-1.5" />
                      <span className="text-[9px] font-mono font-bold text-white tracking-widest bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-400/40">
                        NEURAL MESH REVEAL
                      </span>
                      <span className="text-[8px] font-mono text-cyan-300 mt-1">HASH: 0x7F4A992C</span>
                    </div>
                  )}
                </div>

                {/* Verified Identity Badge Floating Pill */}
                <div
                  className="absolute -bottom-2 -right-2 px-2.5 py-1.5 rounded-2xl bg-[#030712] shadow-2xl border border-cyan-400/90 flex items-center gap-1.5 group-hover:border-cyan-300 transition-colors"
                  title="Cryptographically Verified Identity (Hash: 0x7F4A992C)"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-cyan-300">PROVEN IDENTITY</span>
                </div>
              </div>

              {/* Headline Title & Primary Roles */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>00 // AI SYSTEMS ARCHITECT & CREATIVE TECHNOLOGIST</span>
                </div>

                <h1
                  id="hero-headline-title"
                  className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-headings text-liquid-gradient leading-[1.08] mb-3"
                >
                  Yashwanth Reddy G
                </h1>

                <p className="text-xs sm:text-sm font-mono text-slate-300 flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400">Identity:</span>
                  <span className="text-cyan-300 font-bold bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
                    0x7F4A992C
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Autonomous Swarm Online
                  </span>
                </p>
              </div>
            </div>

            {/* Architectural Bio / Manifesto */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-body mb-8 max-w-2xl font-normal">
              Directing self-governing multi-agent intelligence systems, calibrated pgvector semantic embeddings, and high-throughput production architectures backed by tamper-proof cryptographic evidence trails.
            </p>

            {/* Quantitative Architecture Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-cyan-400/40 transition-colors backdrop-blur-xl flex items-center gap-3 shadow-lg">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white font-headings">7 Agents</div>
                  <div className="text-[10px] text-cyan-300 font-mono">Specialized Fleet</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-400/40 transition-colors backdrop-blur-xl flex items-center gap-3 shadow-lg">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white font-headings">pgvector 384-d</div>
                  <div className="text-[10px] text-purple-300 font-mono">Semantic Retrieval</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-400/40 transition-colors backdrop-blur-xl flex items-center gap-3 col-span-2 sm:col-span-1 shadow-lg">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white font-headings">18 Claims</div>
                  <div className="text-[10px] text-emerald-300 font-mono">100% Cryptographic Proof</div>
                </div>
              </div>
            </div>

            {/* CTAs & Navigation Actions */}
            <div className="flex flex-wrap items-center gap-3.5 w-full">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white font-tech font-bold text-xs hover:opacity-95 transition-all duration-200 shadow-liquid-glow"
              >
                <span>Explore Project Universe</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#about"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/[0.03] text-slate-200 font-tech font-bold text-xs border border-white/15 hover:bg-white/[0.08] hover:text-white transition-all shadow-sm"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Read Dossier</span>
              </a>

              {onTriggerRebuild && (
                <button
                  type="button"
                  onClick={onTriggerRebuild}
                  disabled={isAssembling || isGitUpdating}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900/90 text-cyan-300 font-tech font-bold text-xs border border-cyan-500/40 hover:bg-slate-800 transition-all duration-200 shadow-sm"
                  title="Re-run the full autonomous generative assembly sequence"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{isAssembling ? "Assembling..." : "Re-Build All"}</span>
                </button>
              )}

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

          {/* Right Column: Liquid Metallic 3D Interactive Sculpture (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <AICore3D
              reducedMotion={reducedMotion}
              activeAgentId={activeAgentId}
              onSelectAgent={onSelectAgent}
            />
          </div>
        </div>
      </div>

      {/* Biometric Evidence Modal */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-lg w-full rounded-3xl p-6 sm:p-8 bg-slate-900 border border-cyan-500/50 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowBiometricModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-headings text-white">Biometric Identity Verification</h3>
                <p className="text-xs text-slate-400 font-mono">Cryptographic sovereign proof ledger</p>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10">
                <span className="text-slate-500 block mb-1">SOVEREIGN OWNER:</span>
                <span className="text-white font-bold text-sm">Yashwanth Reddy G</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10">
                <span className="text-slate-500 block mb-1">BIOMETRIC PHOTOGRAPH SHA-256 HASH:</span>
                <span className="text-cyan-400 font-mono text-[11px] break-all">
                  0x7F4A992C81DF449B8902A7E4F2819C338E401B4D209A781E0C9B6A43D1
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
                  <span className="text-slate-500 block text-[10px]">FACIAL MATCH:</span>
                  <span className="text-emerald-400 font-bold">99.8% Calibrated</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
                  <span className="text-slate-500 block text-[10px]">VERIFIED CLAIMS:</span>
                  <span className="text-cyan-400 font-bold">18 Evidence Trails</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowBiometricModal(false);
                onInspectEvidence?.("ev-repo-yashuverse-001");
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-tech font-bold text-xs hover:opacity-95 transition-all shadow-liquid-glow"
            >
              Open Full Cryptographic Audit Evidence
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

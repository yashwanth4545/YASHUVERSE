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
  Camera,
} from "lucide-react";

interface HeroSectionProps {
  reducedMotion?: boolean;
  activeAgentId?: AgentId | null;
  onSelectAgent?: (agentId: AgentId) => void;
  onInspectEvidence?: (evidenceId: string) => void;
  version?: number;
  sseStatus?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  reducedMotion = false,
  activeAgentId,
  onSelectAgent,
  onInspectEvidence,
  version = 1,
  sseStatus = "connected",
}) => {

  return (
    <section id="hero" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-cyan-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Personal Identity & Bio (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Ecosystem Telemetry Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-sm text-xs font-tech text-slate-800 mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-semibold text-slate-900">YASHUVERSE ECOSYSTEM</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 font-mono font-medium uppercase">
                {sseStatus === "connected" ? "LIVE SSE ACTIVE" : sseStatus}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono">v{version}.0</span>
            </div>

            {/* Profile Avatar Frame + Name Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5 w-full">
              {/* Luxury Studio Portrait Frame */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-slate-200 via-white to-blue-300 shadow-glass-elevated border border-white">
                  <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex flex-col items-center justify-center relative overflow-hidden border border-slate-200/80">
                    {/* Portrait Placeholder with Cinematic Lighting */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-100 to-slate-200 opacity-90" />
                    <Camera className="w-6 h-6 text-slate-400 relative z-10 mb-1" />
                    <span className="text-[9px] font-mono font-semibold text-slate-500 text-center px-2 relative z-10 leading-tight">
                      PORTRAIT READY
                    </span>
                    {/* Electric Blue Specular Edge */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500/20 blur-md pointer-events-none" />
                  </div>
                </div>

                {/* Verified Identity Badge */}
                <div
                  className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-white shadow-md border border-slate-200"
                  title="Cryptographically Verified Identity"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              {/* Headline Title */}
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-600 mb-1 block">
                  Systems Architect & ML Engineer
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight font-headings">
                  Yashwanth Reddy G
                </h1>
              </div>
            </div>

            {/* Professional Role & Executive Summary */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-body mb-6 max-w-2xl">
              Architecting self-governing multi-agent systems, calibrated machine learning pipelines, and resilient full-stack applications with cryptographic provenance.
            </p>

            {/* Key Engineering Pillars Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full mb-8 font-tech text-xs">
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">7-Agent Fleet</div>
                  <div className="text-[10px] text-slate-500 font-mono">Real-time DAG</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Custom ML & NLP</div>
                  <div className="text-[10px] text-slate-500 font-mono">Calibrated (≥0.92)</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Zero Hallucinations</div>
                  <div className="text-[10px] text-slate-500 font-mono">Evidence-Backed</div>
                </div>
              </div>
            </div>

            {/* CTAs and Verified Social Links */}
            <div className="flex flex-wrap items-center gap-3 w-full">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-tech font-semibold text-xs hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>Explore Project Universe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#workspace"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-800 font-tech font-semibold text-xs border border-slate-200/90 hover:bg-slate-50 transition-all duration-200 shadow-sm"
              >
                <span>Live Agent Workspace</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </a>

              <button
                type="button"
                onClick={() => onInspectEvidence?.("ev-repo-yashuverse-001")}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 font-mono text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>18 Verified Claims</span>
              </button>

              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <a
                  href="https://github.com/yashwanth4545"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                  title="GitHub Profile (@yashwanth4545)"
                >
                  <Github className="w-4 h-4" />
                </a>

                <a
                  href="https://linkedin.com/in/yashwanthreddy-g"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-white border border-slate-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Sculpture (5 cols) */}
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

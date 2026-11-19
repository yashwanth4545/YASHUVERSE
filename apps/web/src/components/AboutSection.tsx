import React from "react";
import {
  ShieldCheck,
  Terminal,
  Cpu,
  Sparkles,
  Code2,
  Database,
  ArrowUpRight,
  Zap,
} from "lucide-react";

interface AboutSectionProps {
  onInspectEvidence?: (evidenceId: string) => void;
  isGenerating?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onInspectEvidence,
  isGenerating = false,
}) => {
  return (
    <section id="about" className={`py-20 md:py-32 relative border-t border-white/[0.06] overflow-hidden scroll-mt-20 ${isGenerating ? "opacity-95" : "opacity-100"}`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Pre-title and Big Typography */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>01 // ARCHITECT DOSSIER</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-headings text-white">
                Engineering Autonomous <br className="hidden sm:block" />
                <span className="text-liquid-gradient">Intelligence Systems</span>
              </h2>
            </div>
            <p className="text-base sm:text-lg text-slate-400 font-body max-w-xl leading-relaxed">
              Synthesizing autonomous agent swarms, calibrated semantic vector retrieval, and cryptographic evidence architectures that bridge the gap between speculative AI and tamper-proof production engineering.
            </p>
          </div>
        </div>

        {/* Bento Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: The Core Mission & Manifesto (Large 7 Cols) */}
          <div className="md:col-span-12 lg:col-span-7 rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#0c1222]/90 via-[#070b14]/90 to-[#03060d]/90 border border-white/10 hover:border-cyan-500/40 transition-all duration-500 shadow-2xl relative group overflow-hidden">
            {/* Corner Decorative Tech Elements */}
            <div className="absolute top-4 right-4 font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CORE_PHILOSOPHY.SYS</span>
            </div>

            <div className="p-3.5 w-fit rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 mb-6">
              <Terminal className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-headings text-white mb-4 leading-snug">
              "Code is only as truthful as the evidence that proves it."
            </h3>

            <div className="space-y-4 text-slate-300 font-body text-sm sm:text-base leading-relaxed">
              <p>
                I am <span className="text-white font-semibold">Yashwanth Reddy G</span>, an Autonomous AI Systems Architect and Creative Technologist. I build self-governing software ecosystems where multi-agent swarms discover, write, benchmark, secure, and publish software directly from git telemetry.
              </p>
              <p className="text-slate-400">
                In an era crowded with shallow AI wrappers and unverified claims, YASHUVERSE was engineered from first principles: <strong>zero hallucinations</strong>, <strong>100% cryptographic claim verification</strong>, and deterministic DAG task execution across specialized agents.
              </p>
            </div>

            {/* Evidence Link Trigger */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Cryptographic ID: <span className="text-cyan-400">0x7F4A992C</span>
                </span>
              </div>

              {onInspectEvidence && (
                <button
                  type="button"
                  onClick={() => onInspectEvidence("ev-repo-yashuverse-001")}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors group/btn"
                >
                  <span>Inspect Audit Proof</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Core Engineering Pillars (5 Cols) */}
          <div className="md:col-span-12 lg:col-span-5 rounded-3xl p-8 sm:p-10 bg-[#080d1a]/80 border border-white/10 hover:border-purple-500/40 transition-all duration-500 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 w-fit rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                  SYSTEM PILLARS
                </span>
              </div>

              <h4 className="text-xl font-bold font-headings text-white mb-6">
                Architectural Foundation
              </h4>

              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-colors">
                  <div className="text-xs font-mono font-bold text-cyan-400 mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Autonomous Multi-Agent Swarms
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Deterministic DAG workflow orchestration across 7 isolated specialized agents with blackboard shared memory.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-colors">
                  <div className="text-xs font-mono font-bold text-purple-400 mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Semantic Vector Intelligence
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    pgvector 384-dimensional dense semantic embeddings, calibrated duplicate detection, and repository classification.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-colors">
                  <div className="text-xs font-mono font-bold text-emerald-400 mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Zero-Trust SecOps & Proofs
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automated regex leak scanners, AST prompt-injection sanitization, and human-in-the-loop review tickets.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Status: Active Production</span>
              <span className="text-emerald-400 font-bold">100% Spec Pass</span>
            </div>
          </div>

          {/* Card 3: Deep Technical Stack Matrix (6 Cols) */}
          <div className="md:col-span-12 lg:col-span-6 rounded-3xl p-8 bg-[#080d1a]/80 border border-white/10 hover:border-blue-500/40 transition-all duration-500 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold font-headings text-white">Full-Stack & Systems Stack</h4>
                <p className="text-xs text-slate-400 font-mono">Battle-tested tools for high-throughput distributed systems</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: "TypeScript", desc: "Strict Types & Contracts", badge: "Primary" },
                { name: "Python / FastAPI", desc: "ML Services & PyTorch", badge: "ML Core" },
                { name: "Node.js / Express", desc: "Event Orchestrators", badge: "Engine" },
                { name: "React + Vite", desc: "Liquid Cybernetic UI", badge: "Frontend" },
                { name: "Three.js / WebGL", desc: "3D Spatial Interactive", badge: "Creative" },
                { name: "PostgreSQL + pgvector", desc: "Vector Similarity Search", badge: "Database" },
                { name: "Docker & Cloud Run", desc: "Containerized Workloads", badge: "Infra" },
                { name: "Firebase Hosting", desc: "Global Edge Distribution", badge: "Deploy" },
                { name: "GitHub Actions", desc: "Automated CI/CD Pipelines", badge: "Automation" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-white/[0.06] hover:border-cyan-400/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 font-tech">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Verified Quantitative Impact (6 Cols) */}
          <div className="md:col-span-12 lg:col-span-6 rounded-3xl p-8 bg-[#080d1a]/80 border border-white/10 hover:border-emerald-500/40 transition-all duration-500 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-headings text-white">Engineering Telemetry</h4>
                  <p className="text-xs text-slate-400 font-mono">Live verified system performance indicators</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.06] text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold font-headings text-white">7</div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase mt-1">Autonomous Agents</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.06] text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold font-headings text-emerald-400">18</div>
                  <div className="text-[10px] font-mono text-emerald-400 uppercase mt-1">Verified Claims</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.06] text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold font-headings text-purple-400">0.99</div>
                  <div className="text-[10px] font-mono text-purple-400 uppercase mt-1">Vector Precision</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/[0.06] text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold font-headings text-amber-400">0</div>
                  <div className="text-[10px] font-mono text-amber-400 uppercase mt-1">Secret Leaks</div>
                </div>
              </div>
            </div>

            {/* Quick Bio Summary Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-200 font-body">
                  Available for select high-impact AI architecture & full-stack leadership initiatives.
                </span>
              </div>
              <a
                href="#contact"
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-tech font-bold text-xs transition-colors"
              >
                Reach Out
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

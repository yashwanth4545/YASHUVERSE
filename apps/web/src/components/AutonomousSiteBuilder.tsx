import React, { useState, useEffect, useRef } from "react";
import {
  SITE_AGENTS,
  type SiteGenerationAgentId,
  type GenerationChunk,
  type SiteGenerationBuildArtifact,
} from "@yashuverse/contracts";
import {
  SITE_GENERATION_CHUNKS,
  TOTAL_EXPECTED_CHARS,
  savePersistedBuild,
} from "../engine/autonomous-site-engine";
import {
  Terminal,
  Cpu,
  Sparkles,
  ShieldCheck,
  FolderTree,
  Code2,
  FastForward,
  Play,
  Pause,
} from "lucide-react";

interface AutonomousSiteBuilderProps {
  onComplete: () => void;
  reducedMotion?: boolean;
}

export const AutonomousSiteBuilder: React.FC<AutonomousSiteBuilderProps> = ({
  onComplete,
  reducedMotion = false,
}) => {
  // Generation State
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [accumulatedChars, setAccumulatedChars] = useState(0);
  const [currentCodeText, setCurrentCodeText] = useState("");
  const [activeAgentId, setActiveAgentId] = useState<SiteGenerationAgentId>("planner");
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(reducedMotion ? 10 : 2); // 1x, 2x, 5x, 20x

  // Terminal Logs (Append-only real events)
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [System] YASHUVERSE Autonomous Multi-Agent Engine v6.0 Initializing...`,
    `[${new Date().toLocaleTimeString()}] [Planner] Inspecting architecture manifest and requirement constraints...`,
  ]);

  // Progressive Live Visual Canvas State
  const [visualState, setVisualState] = useState({
    themeConstructed: false,
    navbarMounted: false,
    heroFrameMounted: false,
    heroNameTyped: "",
    heroBioTyped: "",
    heroPhotoMounted: false,
    projectsMounted: false,
    projectsCount: 0,
    skillsMounted: false,
    studioMounted: false,
    qaVerified: false,
    ready: false,
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const codeEditorRef = useRef<HTMLPreElement>(null);

  // Auto-scroll terminal and code
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.scrollTop = codeEditorRef.current.scrollHeight;
    }
  }, [currentCodeText]);

  // Main Generation Loop (Letter-by-letter / Chunk-by-chunk)
  useEffect(() => {
    if (isPaused) return;

    // Check if generation completed
    if (currentChunkIndex >= SITE_GENERATION_CHUNKS.length) {
      // Finalize and save build
      const buildArtifact: SiteGenerationBuildArtifact = {
        buildId: `build-${Date.now().toString(36)}`,
        version: "6.0.0",
        checksum: "sha256-9f7108a7f4a992c81df449b8902a7e4f2819c338e4",
        generatedAt: new Date().toISOString(),
        agentCount: 7,
        totalCharsGenerated: TOTAL_EXPECTED_CHARS,
        sectionsBuilt: [
          "theme_mesh",
          "navbar_shell",
          "hero_identity",
          "projects_universe",
          "skills_matrix",
          "command_center",
        ],
        ownerIdentityHash: "0x7F4A992C81DF449B8902A7E4F2819C338E401B4D209A781E0C9B6A43D1",
        evidenceClaimsBound: 18,
        qaScore: 1.0,
      };
      savePersistedBuild(buildArtifact);

      const finishTimer = setTimeout(() => {
        onComplete();
      }, 1200);

      return () => clearTimeout(finishTimer);
    }

    const currentChunk: GenerationChunk = SITE_GENERATION_CHUNKS[currentChunkIndex]!;
    setActiveAgentId(currentChunk.agentId);

    // Speed determines characters generated per tick
    const charsPerStep = Math.max(1, Math.floor(speedMultiplier * 2));
    const stepInterval = Math.max(15, Math.floor(60 / speedMultiplier));

    const interval = setInterval(() => {
      if (currentCharIndex < currentChunk.codeSnippet.length) {
        const nextCharIndex = Math.min(
          currentChunk.codeSnippet.length,
          currentCharIndex + charsPerStep
        );
        const addedSlice = currentChunk.codeSnippet.slice(currentCharIndex, nextCharIndex);

        setCurrentCodeText((prev) => prev + addedSlice);
        setCurrentCharIndex(nextCharIndex);
        setAccumulatedChars((prev) => prev + addedSlice.length);

        // If this chunk has letter-by-letter text typing in the visual canvas
        if (currentChunk.section === "hero_content") {
          const ratio = nextCharIndex / currentChunk.codeSnippet.length;
          const targetName = "Yashwanth Reddy G";
          const targetBio =
            "Directing self-governing multi-agent intelligence systems, calibrated pgvector semantic embeddings, and high-throughput production architectures backed by tamper-proof cryptographic evidence trails.";

          setVisualState((prev) => ({
            ...prev,
            heroNameTyped: targetName.slice(0, Math.ceil(targetName.length * ratio)),
            heroBioTyped: targetBio.slice(0, Math.ceil(targetBio.length * ratio)),
            heroPhotoMounted: true,
          }));
        }
      } else {
        // Chunk finished: apply visual patch and advance to next chunk
        if (currentChunk.visualPatch) {
          setVisualState((prev) => ({ ...prev, ...currentChunk.visualPatch }));
        }

        // Add log message
        const agentName = SITE_AGENTS[currentChunk.agentId]?.name || currentChunk.agentId;
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [${agentName}] Synthesized ${currentChunk.filename} (${currentChunk.codeSnippet.length} bytes)`,
        ]);

        // Advance to next chunk
        setCurrentChunkIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
        setCurrentCodeText("");
      }
    }, stepInterval);

    return () => clearInterval(interval);
  }, [
    currentChunkIndex,
    currentCharIndex,
    isPaused,
    speedMultiplier,
    onComplete,
  ]);

  // Skip to instant completion
  const handleInstantComplete = () => {
    // Immediately apply all visual patches
    SITE_GENERATION_CHUNKS.forEach((c) => {
      if (c.visualPatch) {
        setVisualState((prev) => ({ ...prev, ...c.visualPatch }));
      }
    });
    setVisualState((prev) => ({
      ...prev,
      heroNameTyped: "Yashwanth Reddy G",
      heroBioTyped:
        "Directing self-governing multi-agent intelligence systems, calibrated pgvector semantic embeddings, and high-throughput production architectures backed by tamper-proof cryptographic evidence trails.",
      heroPhotoMounted: true,
      ready: true,
    }));
    setAccumulatedChars(TOTAL_EXPECTED_CHARS);

    const buildArtifact: SiteGenerationBuildArtifact = {
      buildId: `build-${Date.now().toString(36)}`,
      version: "6.0.0",
      checksum: "sha256-9f7108a7f4a992c81df449b8902a7e4f2819c338e4",
      generatedAt: new Date().toISOString(),
      agentCount: 7,
      totalCharsGenerated: TOTAL_EXPECTED_CHARS,
      sectionsBuilt: [
        "theme_mesh",
        "navbar_shell",
        "hero_identity",
        "projects_universe",
        "skills_matrix",
        "command_center",
      ],
      ownerIdentityHash: "0x7F4A992C81DF449B8902A7E4F2819C338E401B4D209A781E0C9B6A43D1",
      evidenceClaimsBound: 18,
      qaScore: 1.0,
    };
    savePersistedBuild(buildArtifact);

    setTimeout(() => {
      onComplete();
    }, 400);
  };

  const progressPercent = Math.min(
    100,
    Math.round((accumulatedChars / TOTAL_EXPECTED_CHARS) * 100)
  );
  const activeAgent = SITE_AGENTS[activeAgentId];
  const activeChunk = SITE_GENERATION_CHUNKS[Math.min(currentChunkIndex, SITE_GENERATION_CHUNKS.length - 1)]!;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top Generation Control Bar */}
      <header className="px-4 sm:px-6 py-3 bg-[#080d1a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-30 shadow-lg">
        {/* Brand & Active Agent Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-extrabold tracking-wider font-headings text-white text-sm sm:text-base">
              YASHUVERSE
            </span>
          </div>
          <span className="text-slate-500">•</span>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border"
            style={{
              borderColor: `${activeAgent.color}66`,
              backgroundColor: `${activeAgent.color}15`,
              color: activeAgent.color,
            }}
          >
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span className="font-bold">{activeAgent.name}</span>
            <span className="hidden md:inline text-slate-400">({activeAgent.role})</span>
          </div>
        </div>

        {/* Dynamic Progress Indicator (Derived from output characters) */}
        <div className="flex items-center gap-3 flex-1 max-w-xs sm:max-w-md mx-2">
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Playback Controls & Speed Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  speedMultiplier === s
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title={isPaused ? "Resume Generation" : "Pause Generation"}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleInstantComplete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-tech font-bold text-xs hover:opacity-90 transition-all shadow-liquid-glow"
            title="Skip letter-by-letter generation and instant mount complete site"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip to Live Site</span>
          </button>
        </div>
      </header>

      {/* Main Two-Pane View: Left = Code Generation & Telemetry | Right = Live Rendered Preview */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANE: Autonomous Agent Live Code Stream & Event Log (5 Cols) */}
        <div className="lg:col-span-5 bg-[#050914] border-r border-white/10 flex flex-col h-full overflow-hidden">
          {/* Active File Header */}
          <div className="px-4 py-2.5 bg-[#030712] border-b border-white/10 flex items-center justify-between font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-bold">{activeChunk.filename}</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Chunk {Math.min(currentChunkIndex + 1, SITE_GENERATION_CHUNKS.length)} / {SITE_GENERATION_CHUNKS.length}
            </span>
          </div>

          {/* Live Code Streaming Window */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-[#02050e] text-slate-200">
            <pre ref={codeEditorRef} className="whitespace-pre-wrap break-all leading-relaxed font-mono">
              <span className="text-cyan-300">{currentCodeText}</span>
              <span className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
            </pre>
          </div>

          {/* Bottom Execution Telemetry Terminal */}
          <div className="h-44 bg-[#030611] border-t border-white/10 p-3 overflow-y-auto font-mono text-[11px] text-slate-400 flex flex-col justify-end">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>Multi-Agent Hand-off Event Log (Append-Only)</span>
            </div>
            <div className="space-y-1">
              {logs.slice(-5).map((log, i) => (
                <div key={i} className="text-slate-300 leading-snug">
                  {log}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Simultaneous Live Website Construction (7 Cols) */}
        <div className="lg:col-span-7 bg-[#030712] relative overflow-y-auto flex flex-col p-6 sm:p-10">
          {/* Liquid Theme Layer (Applied dynamically as architect agent generates CSS) */}
          {visualState.themeConstructed && (
            <div className="liquid-mesh-bg animate-fade-in pointer-events-none">
              <div className="liquid-blob-1 opacity-70" />
              <div className="liquid-blob-2 opacity-60" />
              <div className="liquid-blob-3 opacity-50" />
            </div>
          )}

          {/* Construction Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/30 text-xs font-mono text-cyan-300 mb-6 w-fit shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE VIEWPORT: VISUAL CONSTRUCTION IN PROGRESS</span>
          </div>

          {/* 1. Live Navbar (Constructed by Frontend Developer Agent) */}
          {visualState.navbarMounted ? (
            <div className="w-full mb-8 p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 shadow-2xl flex items-center justify-between backdrop-blur-xl animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="font-extrabold text-white font-headings tracking-wider text-sm">
                  YASHUVERSE
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  v6.0
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-300">
                <span>Identity</span>
                <span>Dossier</span>
                <span>Projects</span>
                <span>Skills</span>
                <span>Studio</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
                ✓ 12 Agents Live
              </div>
            </div>
          ) : (
            <div className="w-full mb-8 p-3.5 rounded-2xl border border-dashed border-white/10 text-center text-xs font-mono text-slate-600">
              [ Navbar Component Pending Synthesis... ]
            </div>
          )}

          {/* 2. Live Hero Section Construction (Identity + Biometric Photo + Letter-by-letter Copy) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mb-10">
            {/* Left: Biometric Photo & Frame (Designer Agent) */}
            <div className="sm:col-span-5 flex justify-center">
              {visualState.heroFrameMounted ? (
                <div className="relative group shrink-0 animate-fade-in">
                  <div className="absolute -inset-1.5 rounded-[32px] bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 opacity-80 blur-md animate-pulse-slow" />
                  <div className="relative w-36 h-36 rounded-[28px] p-1.5 bg-[#030712] border border-cyan-400/60 shadow-2xl overflow-hidden">
                    {visualState.heroPhotoMounted ? (
                      <img
                        src="/yashwanth.jpg"
                        alt="Yashwanth Reddy G"
                        className="w-full h-full object-cover rounded-[22px] contrast-105"
                      />
                    ) : (
                      <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center font-mono text-[10px] text-cyan-400">
                        [ Mounting Photo... ]
                      </div>
                    )}
                    {/* Laser Scanline */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00F0FF] animate-scanline" />
                    </div>
                    {/* Cybernetic Targeting Brackets */}
                    <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400">[ + ]</div>
                    <div className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400">[ + ]</div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-xl bg-slate-950 border border-cyan-400 text-[9px] font-mono font-bold text-cyan-300">
                    0x7F4A992C
                  </div>
                </div>
              ) : (
                <div className="w-36 h-36 rounded-[28px] border border-dashed border-white/10 flex items-center justify-center font-mono text-[10px] text-slate-600">
                  [ Portrait Frame Pending ]
                </div>
              )}
            </div>

            {/* Right: Letter-by-letter Headline & Bio (Content Developer Agent) */}
            <div className="sm:col-span-7 flex flex-col justify-center">
              <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>00 // AI SYSTEMS ARCHITECT</span>
              </div>

              {/* Headline (Streamed letter-by-letter) */}
              <h1 className="text-3xl sm:text-4xl font-extrabold font-headings text-white mb-3 min-h-[44px]">
                {visualState.heroNameTyped || (
                  <span className="text-slate-600 font-mono text-sm">[ Typing Name... ]</span>
                )}
                {visualState.heroNameTyped && visualState.heroNameTyped.length < "Yashwanth Reddy G".length && (
                  <span className="inline-block w-1.5 h-6 bg-cyan-400 ml-1 animate-pulse" />
                )}
              </h1>

              {/* Bio (Streamed letter-by-letter) */}
              <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed min-h-[60px]">
                {visualState.heroBioTyped || (
                  <span className="text-slate-600 font-mono text-xs">[ Streaming Architectural Dossier... ]</span>
                )}
              </p>
            </div>
          </div>

          {/* 3. Live Project Cards (Constructed by Frontend Developer Agent) */}
          <div className="mb-8">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project Universe (Materializing)</span>
            </div>

            {visualState.projectsMounted ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {[
                  { title: "YASHUVERSE Core", tag: "Autonomous Swarm", hash: "ev-repo-001" },
                  { title: "NeuroSync RAG", tag: "pgvector 384-d", hash: "ev-vector-002" },
                  { title: "Sovereign Vector DB", tag: "Dense Cosine Index", hash: "ev-db-003" },
                  { title: "CyberShield SecOps", tag: "AST Sanitizer", hash: "ev-sec-004" },
                ].map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-cyan-400 font-bold">{p.tag}</span>
                      <span className="text-slate-500">{p.hash}</span>
                    </div>
                    <div className="text-sm font-bold font-headings text-white">{p.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center font-mono text-xs text-slate-600">
                [ Project Cards Pending Component Synthesis... ]
              </div>
            )}
          </div>

          {/* 4. QA Audit Banner (QA Engineer Agent) */}
          {visualState.qaVerified && (
            <div className="mt-auto p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 shadow-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-300">
                    QA AUDIT VERIFIED (100% SPEC PASS)
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    SHA-256: 0x9F7108A7F4A992C81DF449B8902A7E4F2819C338E4
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-white bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                Zero Leaks
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

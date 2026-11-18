import React from "react";
import { Play, RotateCcw, Activity, ShieldCheck, Cpu } from "lucide-react";

interface DemoControlBarProps {
  isRunning: boolean;
  onTriggerDemo: () => void;
  onReset: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  isRunning,
  onTriggerDemo,
  onReset,
  reducedMotion,
  onToggleReducedMotion,
}) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-4 border-2 border-electric-500/30 bg-gradient-to-r from-blue-50/70 via-white/80 to-indigo-50/70 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Label & Description */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-electric-600 text-white shadow-glow-subtle mt-0.5">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-electric-600 text-white">
                DEMO MODE
              </span>
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Truthful Multi-Agent Simulation
              </span>
              {isRunning && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                  <Activity className="w-3 h-3 animate-spin text-emerald-600" />
                  Workflow Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Triggers the deterministic 8-agent workflow: Source ingestion (HMAC & SHA-256) → ML TF-IDF classification →
              Project canonical synthesis → Evidence policy audit → Zod validation → Atomic publish transaction.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
          <button
            type="button"
            disabled={isRunning}
            onClick={onTriggerDemo}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all duration-200 ${
              isRunning
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-electric-600 hover:bg-electric-700 active:scale-95 shadow-glow"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? "Simulating Workflow..." : "Trigger Inbound Workflow"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-colors"
            title="Reset agents to idle state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset
          </button>

          {/* Reduced-Motion Accessibility Toggle */}
          <button
            type="button"
            onClick={onToggleReducedMotion}
            className={`px-3 py-2 rounded-xl text-xs font-mono border transition-colors ${
              reducedMotion
                ? "bg-amber-50 text-amber-800 border-amber-300 font-semibold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            title="Toggle cursor motion animation"
          >
            Motion: {reducedMotion ? "Stationary (Accessible)" : "Live Smooth"}
          </button>
        </div>
      </div>
    </div>
  );
};

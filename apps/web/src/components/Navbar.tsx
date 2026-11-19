import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useScrollSpy } from "../hooks/useScrollSpy";
import {
  History,
  Unlock,
  Lock,
  Menu,
  X,
  Zap,
  GitBranch,
} from "lucide-react";

interface NavbarProps {
  version: number;
  onOpenVersions: () => void;
  onOpenCommandCenter: () => void;
  onOpenApprovals?: () => void;
  pendingApprovalsCount?: number;
  sseStatus?: string;
  onTriggerRebuild?: () => void;
  isAssembling?: boolean;
  onTriggerGitUpdate?: (msg?: string) => void;
  isGitUpdating?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  version,
  onOpenVersions,
  onOpenCommandCenter,
  onOpenApprovals,
  pendingApprovalsCount = 0,
  sseStatus = "connected",
  onTriggerRebuild,
  isAssembling = false,
  onTriggerGitUpdate,
  isGitUpdating = false,
}) => {
  const { isOwner } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "Identity" },
    { id: "about", label: "Dossier" },
    { id: "workspace", label: "Fleet" },
    { id: "realtime-editor", label: "Editor" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  const activeSection = useScrollSpy(
    navItems.map((n) => n.id),
    120
  );

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#030712]/80 backdrop-blur-2xl border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Telemetry Indicator */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-liquid-glow group-hover:scale-105 transition-transform p-0.5">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                <span className="font-headings font-black text-sm text-cyan-300 tracking-wider">Y</span>
              </div>
            </div>
            <div className="flex flex-col" title={`Stream Status: ${sseStatus}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-headings font-extrabold text-white text-sm tracking-tight">
                  YASHUVERSE
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sseStatus === "connected" ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F0FF]" : "bg-amber-500"
                  }`}
                />
              </div>
              <span className="text-[9px] font-mono text-cyan-300/80 -mt-0.5">
                Autonomous AI Systems
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-cyan-300 border border-white/20 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Git Update Simulation CTA */}
            {onTriggerGitUpdate && (
              <button
                type="button"
                onClick={() => onTriggerGitUpdate("feat: update neural retrieval memory & ast pipeline")}
                disabled={isAssembling || isGitUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white text-xs font-mono transition-all"
                title="Simulate Git Push to watch the agents wake up and re-compile"
              >
                <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isGitUpdating ? "Syncing Git..." : "Simulate Push"}</span>
              </button>
            )}

            {/* Run Auto-Build CTA */}
            {onTriggerRebuild && (
              <button
                type="button"
                onClick={onTriggerRebuild}
                disabled={isAssembling || isGitUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white text-xs font-tech font-bold hover:opacity-90 transition-all shadow-liquid-glow"
                title="Trigger real-time autonomous agent build sequence"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAssembling ? "Designing..." : "Re-Build"}</span>
              </button>
            )}

            {/* Version History Button */}
            <button
              type="button"
              onClick={onOpenVersions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/80 text-xs font-mono text-slate-300 hover:bg-slate-800 hover:border-cyan-400/40 transition-colors"
              title="Inspect Immutable Version History & Rollback"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>v{version}.4</span>
            </button>

            {/* Pending Approvals Review Badge */}
            {pendingApprovalsCount > 0 && (
              <button
                type="button"
                onClick={onOpenApprovals || onOpenCommandCenter}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-mono font-bold hover:bg-amber-400 transition-colors shadow-liquid-card animate-pulse"
                title={`${pendingApprovalsCount} updates awaiting human approval`}
              >
                <span>Review ({pendingApprovalsCount})</span>
              </button>
            )}

            {/* Command Center & Access Mode Toggle */}
            <button
              type="button"
              onClick={onOpenCommandCenter}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-tech font-semibold transition-all shadow-xs ${
                isOwner
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 ring-2 ring-emerald-400/30"
                  : "bg-slate-900 text-cyan-300 border border-cyan-400/40 hover:bg-slate-800"
              }`}
            >
              {isOwner ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Owner</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Command Center</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 space-y-2 bg-[#030712]/95 backdrop-blur-2xl">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-mono text-slate-200 hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2 px-2">
              {onTriggerGitUpdate && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onTriggerGitUpdate("feat: mobile git trigger");
                  }}
                  className="w-full py-2.5 text-center rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300"
                >
                  Simulate Git Push (Wake Agents)
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenVersions();
                  }}
                  className="flex-1 py-2 text-center rounded-xl border border-white/10 text-xs font-mono text-slate-200"
                >
                  v{version}.4 History
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCommandCenter();
                  }}
                  className="flex-1 py-2 text-center rounded-xl bg-blue-600 text-white text-xs font-tech font-semibold"
                >
                  Command Center
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

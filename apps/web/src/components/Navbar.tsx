import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useScrollSpy } from "../hooks/useScrollSpy";
import {
  History,
  Unlock,
  Lock,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  version: number;
  onOpenVersions: () => void;
  onOpenCommandCenter: () => void;
  onOpenApprovals?: () => void;
  pendingApprovalsCount?: number;
  sseStatus?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  version,
  onOpenVersions,
  onOpenCommandCenter,
  onOpenApprovals,
  pendingApprovalsCount = 0,
  sseStatus = "connected",
}) => {
  const { isOwner } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "Identity" },
    { id: "workspace", label: "Agent Fleet" },
    { id: "realtime-editor", label: "Live Editor" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  const activeSection = useScrollSpy(
    navItems.map((n) => n.id),
    120
  );

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Telemetry Dot */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-headings font-extrabold text-sm tracking-wider">Y</span>
            </div>
            <div className="flex flex-col" title={`Stream Status: ${sseStatus}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-headings font-extrabold text-slate-900 text-sm tracking-tight">
                  YASHUVERSE
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sseStatus === "connected" ? "bg-blue-600 animate-pulse" : "bg-amber-500"
                  }`}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-400 -mt-0.5">
                Autonomous Ecosystem
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-tech font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Version History Button */}
            <button
              type="button"
              onClick={onOpenVersions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 text-xs font-mono text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              title="Inspect Immutable Version History & Rollback"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>v{version}.0</span>
            </button>

            {/* Pending Approvals Review Badge */}
            {pendingApprovalsCount > 0 && (
              <button
                type="button"
                onClick={onOpenApprovals || onOpenCommandCenter}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-tech font-bold hover:bg-amber-600 transition-colors shadow-xs animate-pulse"
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
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/20"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {isOwner ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Owner Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Command Center</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/80 space-y-2 bg-white/95">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-tech font-semibold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 px-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVersions();
                }}
                className="flex-1 py-2 text-center rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
              >
                v{version}.0 History
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCommandCenter();
                }}
                className="flex-1 py-2 text-center rounded-xl bg-slate-900 text-white text-xs font-tech font-semibold"
              >
                Command Center
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

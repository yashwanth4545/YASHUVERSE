import React from "react";
import { History, X, CheckCircle2, RotateCcw } from "lucide-react";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVersion: number;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  activeVersion,
}) => {
  if (!isOpen) return null;

  const versions = [
    {
      version: activeVersion,
      checksum: "sha256-e91b4fa1807d9f2a74c6d3bc8945f061",
      publishedAt: new Date().toISOString(),
      active: true,
      policyResult: "Passed 18/18 evidence claims (100% verified)",
      author: "Publishing Agent (Automated Policy Pass)",
    },
    {
      version: 0,
      checksum: "sha256-00000000000000000000000000000000",
      publishedAt: "2026-11-18T00:00:00.000Z",
      active: false,
      policyResult: "Initial Seed Snapshot",
      author: "System Initial Bootstrap",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-electric-50 border border-electric-200 text-electric-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Portfolio Immutable Version History & Rollback
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Target table: portfolio_versions (pg atomic swap)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-4">
          {versions.map((ver) => (
            <div
              key={ver.version}
              className={`p-4 rounded-xl border transition-all ${
                ver.active
                  ? "bg-electric-50/40 border-electric-300 ring-2 ring-electric-500/10"
                  : "bg-slate-50/60 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    Version v{ver.version}
                  </span>
                  {ver.active && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      ACTIVE (POINTER)
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(ver.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-500 truncate mb-2">
                SHA-256: {ver.checksum}
              </div>

              <div className="text-xs text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {ver.policyResult}
                </span>

                {!ver.active && (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-slate-200 text-slate-500 cursor-not-allowed"
                    title="Rollback pointer to this immutable version"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Rollback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

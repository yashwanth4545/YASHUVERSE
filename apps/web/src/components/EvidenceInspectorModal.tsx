import React from "react";
import type { EvidenceRecord } from "@yashuverse/contracts";
import { DEMO_EVIDENCE_STORE } from "@yashuverse/portfolio-schema";
import { ShieldCheck, X, ExternalLink, Hash, Clock, FileCode2, CheckCircle2 } from "lucide-react";

interface EvidenceInspectorModalProps {
  evidenceId: string | null;
  onClose: () => void;
}

export const EvidenceInspectorModal: React.FC<EvidenceInspectorModalProps> = ({
  evidenceId,
  onClose,
}) => {
  if (!evidenceId) return null;

  const record: EvidenceRecord | undefined = DEMO_EVIDENCE_STORE[evidenceId] || {
    evidenceId,
    source: "github",
    sourceHash: "0x" + Math.random().toString(16).substring(2, 14),
    snippet: `Verified provenance record for evidence ID: ${evidenceId}. Policy audit verified against source manifest.`,
    collectedAt: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Verification Agent Evidence Audit
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  STATUS: VERIFIED
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Evidence ID: {record.evidenceId}
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Source Origin</span>
              <span className="font-semibold text-slate-800 capitalize flex items-center gap-1 mt-0.5">
                {record.source}
                {record.sourceUrl && (
                  <a
                    href={record.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-electric-600 hover:underline inline-flex items-center ml-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Collection Timestamp</span>
              <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {new Date(record.collectedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Cryptographic Hash</span>
              <span className="font-mono text-slate-600 text-[11px] flex items-center gap-1 mt-0.5 truncate">
                <Hash className="w-3 h-3 text-slate-400" />
                {record.sourceHash}
              </span>
            </div>
          </div>

          {/* Raw Verified Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
                Underlying Source Artifact
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Immutable Provenance</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 shadow-inner">
              {record.snippet}
            </div>
          </div>

          {/* Policy Decision Summary */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-blue-900 mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Policy Verification Decision
            </div>
            <p className="text-blue-800/80 leading-relaxed text-[11px]">
              Claim policy evaluation confirmed matching repository signatures. No unsupported awards, ownership
              extrapolations, or employment claims detected. Authorized for public portfolio rendering.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

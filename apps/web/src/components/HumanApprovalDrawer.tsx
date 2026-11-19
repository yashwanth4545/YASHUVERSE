import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, X, AlertTriangle, Loader2 } from "lucide-react";
import type { HumanApprovalTicket } from "@yashuverse/contracts";

interface HumanApprovalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: HumanApprovalTicket[];
  onDecision: (ticketId: string, decision: "approved" | "rejected", reviewerNotes: string) => Promise<void>;
}

export const HumanApprovalDrawer: React.FC<HumanApprovalDrawerProps> = ({
  isOpen,
  onClose,
  tickets,
  onDecision,
}) => {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAction = async (ticketId: string, decision: "approved" | "rejected") => {
    try {
      setSubmittingId(ticketId);
      const notes = notesMap[ticketId] || (decision === "approved" ? "Approved by human operator" : "Rejected by human operator");
      await onDecision(ticketId, decision, notes);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 border border-amber-200 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Human-in-the-Loop Review Queue
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  {tickets.length} PENDING
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Autonomous publishing held pending operator authorization
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

        {/* Tickets List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-semibold text-slate-700">Review Queue Empty</div>
              <div className="text-xs mt-1">All candidate assertions satisfy automated verification policies.</div>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    Ticket ID: {ticket.ticketId}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300">
                    Confidence: {Math.round(ticket.confidenceScore * 100)}%
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-800">
                  {ticket.proposedChangesSummary}
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-start gap-1.5 text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Review Reason:</strong> {ticket.reviewReason}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    <strong>Evidence IDs:</strong> [{ticket.evidenceIds.join(", ")}]
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Reviewer Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter review explanation or authorization reason..."
                    value={notesMap[ticket.ticketId] || ""}
                    onChange={(e) =>
                      setNotesMap({ ...notesMap, [ticket.ticketId]: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={submittingId === ticket.ticketId}
                    onClick={() => handleAction(ticket.ticketId, "rejected")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Reject & Suppress
                  </button>

                  <button
                    type="button"
                    disabled={submittingId === ticket.ticketId}
                    onClick={() => handleAction(ticket.ticketId, "approved")}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    {submittingId === ticket.ticketId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Approve & Publish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

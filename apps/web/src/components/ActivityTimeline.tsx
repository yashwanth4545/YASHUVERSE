import React from "react";
import type { WorkflowEvent } from "@yashuverse/contracts";
import { AGENT_REGISTRY } from "@yashuverse/contracts";
import { Activity, Clock } from "lucide-react";

interface ActivityTimelineProps {
  events: WorkflowEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-glass border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Activity className="w-4 h-4 text-electric-600" />
          Event Stream Ledger ({events.length} Events)
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">Real-time SSE Log</span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-mono">
            Waiting for events... Trigger the demo or connect real stream.
          </div>
        ) : (
          events.map((evt, idx) => {
            const agentDef = evt.agentId ? AGENT_REGISTRY[evt.agentId] : null;
            return (
              <div
                key={evt.eventId || idx}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 border border-slate-200/60 hover:bg-white transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: agentDef?.color || "#94a3b8" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-semibold text-slate-800 truncate">
                      {evt.type}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(evt.occurredAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {agentDef && (
                    <span className="text-[10px] font-medium text-slate-500 block">
                      Agent: {agentDef.name}
                    </span>
                  )}
                  <pre className="text-[9px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded mt-1 overflow-x-auto border border-slate-100">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

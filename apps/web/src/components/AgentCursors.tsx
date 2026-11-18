import React, { useEffect, useState } from "react";
import { AGENT_REGISTRY, type AgentId, type AgentPresenceEvent } from "@yashuverse/contracts";
import { AGENT_COLOR_MAP } from "@yashuverse/ui";

interface AgentCursorsProps {
  presenceMap: Record<AgentId, AgentPresenceEvent>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion?: boolean;
}

interface CursorPosition {
  x: number;
  y: number;
  visible: boolean;
}

export const AgentCursors: React.FC<AgentCursorsProps> = ({
  presenceMap,
  containerRef,
  reducedMotion = false,
}) => {
  const [positions, setPositions] = useState<Record<AgentId, CursorPosition>>({} as any);

  // Update cursor positions based on targetId elements
  useEffect(() => {
    if (reducedMotion) return;

    const updateCoordinates = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newPositions: Record<AgentId, CursorPosition> = {} as any;

      const agentKeys = Object.keys(presenceMap) as AgentId[];
      agentKeys.forEach((agentId) => {
        const presence = presenceMap[agentId];
        if (!presence || presence.state === "idle" || presence.state === "completed") {
          newPositions[agentId] = { x: 0, y: 0, visible: false };
          return;
        }

        if (presence.targetId) {
          const targetEl = document.getElementById(presence.targetId);
          if (targetEl) {
            const targetRect = targetEl.getBoundingClientRect();
            // Calculate position relative to canvas container
            const x = targetRect.left - containerRect.left + targetRect.width * 0.5;
            const y = targetRect.top - containerRect.top + 24;
            newPositions[agentId] = { x, y, visible: true };
            return;
          }
        }

        // If no target DOM element exists yet, position in agent workspace header
        newPositions[agentId] = {
          x: containerRect.width * 0.5 + (Math.random() * 40 - 20),
          y: 80,
          visible: true,
        };
      });

      setPositions(newPositions);
    };

    updateCoordinates();
    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates, { passive: true });

    // Poll layout periodically during active animations to stay locked onto dynamic content
    const interval = setInterval(updateCoordinates, 300);

    return () => {
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates);
      clearInterval(interval);
    };
  }, [presenceMap, containerRef, reducedMotion]);

  if (reducedMotion) {
    return null; // In reduced-motion mode, presence is presented statically in the AgentDock
  }

  const agentKeys = Object.keys(presenceMap) as AgentId[];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {agentKeys.map((agentId) => {
        const presence = presenceMap[agentId];
        const pos = positions[agentId];
        const def = AGENT_REGISTRY[agentId];
        const colorStyle = AGENT_COLOR_MAP[agentId] || {
          bg: "rgba(0,102,255,0.1)",
          text: "#0066ff",
          border: "#0066ff",
          glow: "rgba(0,102,255,0.3)",
        };

        if (!presence || !pos?.visible || presence.state === "idle" || presence.state === "completed") {
          return null;
        }

        return (
          <div
            key={agentId}
            className="agent-cursor"
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            }}
          >
            {/* SVG In-App Pointer */}
            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-md"
              >
                <path
                  d="M3 3L10.5 21L13.8 13.8L21 10.5L3 3Z"
                  fill={def.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Pulsing Target Halo */}
              <div
                className="absolute -top-1 -left-1 w-6 h-6 rounded-full animate-ping opacity-60"
                style={{ backgroundColor: def.color }}
              />

              {/* Agent Badge & Current Live Task Label */}
              <div
                className="absolute left-6 -top-2 flex flex-col items-start whitespace-nowrap px-2.5 py-1.5 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.94)",
                  borderColor: def.color,
                  boxShadow: `0 4px 16px ${colorStyle.glow}`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: def.color }}
                  />
                  <span className="text-[11px] font-semibold tracking-wide text-slate-800">
                    {def.name}
                  </span>
                  <span
                    className="text-[9px] uppercase px-1 py-0.2 rounded font-mono font-medium"
                    style={{ backgroundColor: colorStyle.bg, color: colorStyle.text }}
                  >
                    {presence.state}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium max-w-[260px] truncate mt-0.5">
                  {presence.taskLabel}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

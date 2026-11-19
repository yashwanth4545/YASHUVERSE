import React, { useEffect, useState, useRef } from "react";
import { AGENT_REGISTRY, type AgentId, type AgentPresenceEvent } from "@yashuverse/contracts";
import { AGENT_COLOR_MAP } from "@yashuverse/ui";

interface AgentCursorsProps {
  presenceMap: Record<AgentId, AgentPresenceEvent>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion?: boolean;
  isAssembling?: boolean;
  assemblyStep?: number;
}

interface CursorPosition {
  x: number;
  y: number;
  visible: boolean;
  targetLabel?: string;
  isWorking?: boolean;
}

export const AgentCursors: React.FC<AgentCursorsProps> = ({
  presenceMap,
  containerRef,
  reducedMotion = false,
  isAssembling = false,
  assemblyStep = 0,
}) => {
  const [positions, setPositions] = useState<Record<AgentId, CursorPosition>>({} as any);
  const timeRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;

    const updateCoordinates = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newPositions: Record<AgentId, CursorPosition> = {} as any;
      timeRef.current += 0.05;

      const agentKeys = [
        "orchestrator",
        "source_agent",
        "project_agent",
        "ml_intelligence",
        "verification_agent",
        "content_agent",
        "design_agent",
        "security_agent",
        "quality_agent",
      ] as AgentId[];

      agentKeys.forEach((agentId, index) => {
        const presence = presenceMap[agentId];
        const isWorking = presence?.state === "working" || isAssembling;

        // 1. If explicit DOM target ID is provided and element exists
        if (presence?.targetId) {
          const targetEl = document.getElementById(presence.targetId);
          if (targetEl) {
            const targetRect = targetEl.getBoundingClientRect();
            const x = targetRect.left - containerRect.left + targetRect.width * (0.3 + (index % 3) * 0.2);
            const y = targetRect.top - containerRect.top + Math.min(60, targetRect.height * 0.4);
            newPositions[agentId] = {
              x,
              y,
              visible: true,
              targetLabel: presence.taskLabel,
              isWorking: true,
            };
            return;
          }
        }

        // 2. Specific Assembly Phase Anchoring
        if (isAssembling) {
          if (assemblyStep === 1) {
            // Step 1: Design & Verification Agent lock on portrait
            if (agentId === "design_agent" || agentId === "verification_agent") {
              const portraitEl = document.getElementById("hero-portrait-frame");
              if (portraitEl) {
                const rect = portraitEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "design_agent" ? 40 : rect.width - 40),
                  y: rect.top - containerRect.top + (agentId === "design_agent" ? 30 : rect.height - 30),
                  visible: true,
                  targetLabel: agentId === "design_agent" ? "Constructing Neural Mesh" : "Verifying Biometric Hash",
                  isWorking: true,
                };
                return;
              }
            }
          } else if (assemblyStep === 2) {
            // Step 2: Content Agent flies to title
            if (agentId === "content_agent") {
              const titleEl = document.getElementById("hero-headline-title");
              if (titleEl) {
                const rect = titleEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + rect.width * 0.6,
                  y: rect.top - containerRect.top + 20,
                  visible: true,
                  targetLabel: "Typing Executive Biography",
                  isWorking: true,
                };
                return;
              }
            }
          } else if (assemblyStep === 3) {
            // Step 3: Developer & ML Agent fly to Realtime Editor
            if (agentId === "project_agent" || agentId === "ml_intelligence") {
              const editorEl = document.getElementById("realtime-editor");
              if (editorEl) {
                const rect = editorEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "project_agent" ? 180 : 380),
                  y: rect.top - containerRect.top + 120,
                  visible: true,
                  targetLabel: agentId === "project_agent" ? "Generating Code AST" : "Computing 384-d Embedding",
                  isWorking: true,
                };
                return;
              }
            }
          } else if (assemblyStep === 4) {
            // Step 4: Security & Quality fly across
            if (agentId === "security_agent" || agentId === "quality_agent") {
              const secEl = document.getElementById("workspace");
              if (secEl) {
                const rect = secEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "security_agent" ? rect.width * 0.3 : rect.width * 0.7),
                  y: rect.top - containerRect.top + 80,
                  visible: true,
                  targetLabel: agentId === "security_agent" ? "Scanning Secret Leaks" : "Zod Schema Verification",
                  isWorking: true,
                };
                return;
              }
            }
          }
        }

        // 3. Natural Organic Patrol in Hero/Workspace Area
        const t = timeRef.current + index * 1.2;
        const width = containerRect.width || window.innerWidth;
        const baseY = 240 + (index % 4) * 80;
        const baseX = (width * 0.15) + (index / agentKeys.length) * (width * 0.7);

        const offsetX = Math.sin(t * 0.8) * 45 + Math.cos(t * 0.5) * 20;
        const offsetY = Math.cos(t * 0.7) * 35 + Math.sin(t * 0.4) * 15;

        newPositions[agentId] = {
          x: Math.max(30, Math.min(width - 60, baseX + offsetX)),
          y: Math.max(120, baseY + offsetY),
          visible: true,
          targetLabel: presence?.taskLabel && presence.state !== "idle" ? presence.taskLabel : undefined,
          isWorking,
        };
      });

      setPositions(newPositions);
    };

    updateCoordinates();
    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates, { passive: true });

    const interval = setInterval(updateCoordinates, 80);

    return () => {
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates);
      clearInterval(interval);
    };
  }, [presenceMap, containerRef, reducedMotion, isAssembling, assemblyStep]);

  if (reducedMotion) return null;

  const agentKeys = Object.keys(positions) as AgentId[];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {agentKeys.map((agentId) => {
        const pos = positions[agentId];
        const def = AGENT_REGISTRY[agentId] || { name: agentId, color: "#0066ff" };
        const colorStyle = AGENT_COLOR_MAP[agentId] || {
          bg: "rgba(0,102,255,0.15)",
          text: "#00F0FF",
          border: "#0066FF",
          glow: "rgba(0,102,255,0.4)",
        };

        if (!pos?.visible) return null;

        return (
          <div
            key={agentId}
            className="agent-cursor"
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            }}
          >
            <div className="relative group">
              {/* Modern Cybernetic SVG Arrow Pointer */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              >
                <path
                  d="M3 3L10.5 21L13.8 13.8L21 10.5L3 3Z"
                  fill={def.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Glowing Pulsing Target Aura */}
              <div
                className={`absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full ${
                  pos.isWorking ? "animate-ping opacity-75" : "opacity-35"
                }`}
                style={{ backgroundColor: def.color }}
              />

              {/* Agent Badge & Live Status Pill */}
              <div
                className="absolute left-7 -top-2 flex flex-col items-start whitespace-nowrap px-3 py-1.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300"
                style={{
                  backgroundColor: "rgba(8, 13, 26, 0.94)",
                  borderColor: def.color,
                  boxShadow: `0 8px 24px ${colorStyle.glow}`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: def.color }}
                  />
                  <span className="text-[11px] font-bold tracking-wide text-white font-tech">
                    {def.name}
                  </span>
                  <span
                    className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold"
                    style={{
                      backgroundColor: colorStyle.bg,
                      color: colorStyle.text,
                      border: `1px solid ${def.color}40`,
                    }}
                  >
                    {pos.isWorking ? "Working" : "Patrolling"}
                  </span>
                </div>

                {pos.targetLabel && (
                  <div className="text-[10px] text-cyan-200 font-mono max-w-[240px] truncate mt-0.5">
                    {pos.targetLabel}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React, { useEffect, useState, useRef } from "react";
import { type AgentId, type AgentPresenceEvent } from "@yashuverse/contracts";
import { AGENT_COLOR_MAP } from "@yashuverse/ui";

interface AgentCursorsProps {
  presenceMap: Record<AgentId, AgentPresenceEvent>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion?: boolean;
  isAssembling?: boolean;
  assemblyStep?: number;
  isGitUpdating?: boolean;
}

interface CursorPosition {
  x: number;
  y: number;
  visible: boolean;
  targetLabel?: string;
  isWorking?: boolean;
  roleName: string;
}

export const AgentCursors: React.FC<AgentCursorsProps> = ({
  presenceMap,
  containerRef,
  reducedMotion = false,
  isAssembling = false,
  assemblyStep = 0,
  isGitUpdating = false,
}) => {
  const [positions, setPositions] = useState<Record<AgentId, CursorPosition>>({} as any);
  const timeRef = useRef(0);

  // Active state: cursors only show when actively designing or updating!
  const isActive = isAssembling || isGitUpdating;

  useEffect(() => {
    if (reducedMotion) return;

    const updateCoordinates = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newPositions: Record<AgentId, CursorPosition> = {} as any;
      timeRef.current += 0.04;

      const agentKeys: { id: AgentId; name: string }[] = [
        { id: "orchestrator", name: "Orchestrator Agent" },
        { id: "design_agent", name: "Design & UX Agent" },
        { id: "verification_agent", name: "Verification Agent" },
        { id: "content_agent", name: "Content & Bio Agent" },
        { id: "project_agent", name: "Developer Agent" },
        { id: "ml_intelligence", name: "ML Vector Agent" },
        { id: "security_agent", name: "Security SecOps Agent" },
        { id: "quality_agent", name: "Quality Assurance Agent" },
      ];

      // If neither assembling nor updating, all cursors are hidden (disappear after designing!)
      if (!isActive) {
        agentKeys.forEach(({ id, name }) => {
          newPositions[id] = {
            x: -200,
            y: -200,
            visible: false,
            roleName: name,
            isWorking: false,
          };
        });
        setPositions(newPositions);
        return;
      }

      agentKeys.forEach(({ id: agentId, name: roleName }, index) => {
        const presence = presenceMap[agentId];

        // Specific Git Update mode: Developer & Quality agents converge on projects/editor
        if (isGitUpdating) {
          if (agentId === "project_agent" || agentId === "quality_agent") {
            const targetEl = document.getElementById("projects") || document.getElementById("realtime-editor");
            if (targetEl) {
              const rect = targetEl.getBoundingClientRect();
              const x = rect.left - containerRect.left + (agentId === "project_agent" ? rect.width * 0.35 : rect.width * 0.65);
              const y = rect.top - containerRect.top + 100;
              newPositions[agentId] = {
                x,
                y,
                visible: true,
                targetLabel: agentId === "project_agent" ? "Compiling Git Commit AST..." : "Verifying Release Checksum...",
                isWorking: true,
                roleName,
              };
              return;
            }
          } else {
            newPositions[agentId] = {
              x: -200,
              y: -200,
              visible: false,
              roleName,
              isWorking: false,
            };
            return;
          }
        }

        // Full Autonomous Assembly Mode (Step-by-step designing)
        if (isAssembling) {
          // Step 1: Orchestrator & Design Agent draw the initial scaffolding
          if (assemblyStep === 1) {
            if (agentId === "orchestrator" || agentId === "design_agent") {
              const heroEl = document.getElementById("hero");
              if (heroEl) {
                const rect = heroEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "orchestrator" ? 80 : rect.width * 0.6),
                  y: rect.top - containerRect.top + (agentId === "orchestrator" ? 140 : 180),
                  visible: true,
                  targetLabel: agentId === "orchestrator" ? "Dispatching 7-Agent Assembly DAG" : "Drawing Cybernetic Scaffolding",
                  isWorking: true,
                  roleName,
                };
                return;
              }
            }
          }

          // Step 2: Design & Verification Agent construct the Portrait & Biometric verification
          if (assemblyStep === 2) {
            if (agentId === "design_agent" || agentId === "verification_agent") {
              const portraitEl = document.getElementById("hero-portrait-frame");
              if (portraitEl) {
                const rect = portraitEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "design_agent" ? 25 : rect.width - 25),
                  y: rect.top - containerRect.top + (agentId === "design_agent" ? 30 : rect.height - 30),
                  visible: true,
                  targetLabel: agentId === "design_agent" ? "Synthesizing Neural Photo Mesh" : "Verifying Biometrics (99.8%)",
                  isWorking: true,
                  roleName,
                };
                return;
              }
            }
          }

          // Step 3: Content Agent streams headline & dossier bio
          if (assemblyStep === 3) {
            if (agentId === "content_agent" || agentId === "design_agent") {
              const titleEl = document.getElementById("hero-headline-title") || document.getElementById("hero");
              if (titleEl) {
                const rect = titleEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "content_agent" ? 120 : rect.width * 0.5),
                  y: rect.top - containerRect.top + (agentId === "content_agent" ? rect.height * 0.5 : 80),
                  visible: true,
                  targetLabel: agentId === "content_agent" ? "Streaming Architect Title & Bio" : "Aligning Typography Scale",
                  isWorking: true,
                  roleName,
                };
                return;
              }
            }
          }

          // Step 4: Developer Agent & ML Vector Agent build projects & pgvector embeddings
          if (assemblyStep === 4) {
            if (agentId === "project_agent" || agentId === "ml_intelligence") {
              const projEl = document.getElementById("projects") || document.getElementById("realtime-editor");
              if (projEl) {
                const rect = projEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "project_agent" ? rect.width * 0.3 : rect.width * 0.7),
                  y: rect.top - containerRect.top + 90,
                  visible: true,
                  targetLabel: agentId === "project_agent" ? "Generating AST Manifests" : "Projecting 384-d pgvector Vectors",
                  isWorking: true,
                  roleName,
                };
                return;
              }
            }
          }

          // Step 5: Security & Quality agents sweep through the workspace
          if (assemblyStep === 5) {
            if (agentId === "security_agent" || agentId === "quality_agent") {
              const wsEl = document.getElementById("workspace") || document.getElementById("skills");
              if (wsEl) {
                const rect = wsEl.getBoundingClientRect();
                newPositions[agentId] = {
                  x: rect.left - containerRect.left + (agentId === "security_agent" ? rect.width * 0.25 : rect.width * 0.75),
                  y: rect.top - containerRect.top + 80,
                  visible: true,
                  targetLabel: agentId === "security_agent" ? "SecOps Leak Sweep: 0 Leaks" : "Zod Spec Validation: 100%",
                  isWorking: true,
                  roleName,
                };
                return;
              }
            }
          }

          // Fallback: If agent is assigned a presence targetId
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
                roleName,
              };
              return;
            }
          }
        }

        // Default hidden when not assigned during active phase
        newPositions[agentId] = {
          x: -200,
          y: -200,
          visible: false,
          roleName,
          isWorking: false,
        };
      });

      setPositions(newPositions);
    };

    updateCoordinates();
    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates, { passive: true });

    const interval = setInterval(updateCoordinates, 60);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates);
    };
  }, [presenceMap, containerRef, reducedMotion, isAssembling, assemblyStep, isGitUpdating, isActive]);

  if (reducedMotion || !isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden transition-opacity duration-700 ease-out">
      {Object.entries(positions).map(([agentKey, pos]) => {
        const agentId = agentKey as AgentId;
        if (!pos || !pos.visible) return null;

        const colors = AGENT_COLOR_MAP[agentId] || {
          bg: "rgba(0, 240, 255, 0.1)",
          text: "#00F0FF",
          border: "#00F0FF",
          glow: "rgba(0, 240, 255, 0.4)",
        };
        const hexColor = colors.border || "#00F0FF";

        return (
          <div
            key={agentId}
            className="agent-cursor absolute transition-all duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            }}
          >
            {/* Luminous Pulsing Halo */}
            <div
              className="absolute -inset-3 rounded-full opacity-60 blur-md animate-pulse pointer-events-none"
              style={{ backgroundColor: hexColor }}
            />

            {/* Custom SVG Precision Stylus Cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] filter"
            >
              <path
                d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                fill={hexColor}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Live Agent Badge & Current Task Pill */}
            <div className="absolute left-6 top-1 flex flex-col gap-1 pointer-events-none whitespace-nowrap z-20">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shadow-2xl border backdrop-blur-xl animate-fade-in"
                style={{
                  backgroundColor: "rgba(3, 7, 18, 0.95)",
                  borderColor: hexColor,
                  color: "#ffffff",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: hexColor }}
                />
                <span>{pos.roleName}</span>
              </div>

              {pos.targetLabel && (
                <div
                  className="px-2 py-0.5 rounded-lg text-[9px] font-mono text-cyan-200 border border-white/20 shadow-md backdrop-blur-md"
                  style={{ backgroundColor: "rgba(10, 15, 30, 0.9)" }}
                >
                  {pos.targetLabel}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

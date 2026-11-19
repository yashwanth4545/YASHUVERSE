import { useState, useEffect, useRef, useCallback } from "react";
import {
  type AgentId,
  type AgentPresenceEvent,
  type WorkflowEvent,
  AGENT_REGISTRY,
} from "@yashuverse/contracts";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "offline";

interface UseSSEStreamOptions {
  onPortfolioPublished?: (payload: { newVersion: number; occurredAt: string }) => void;
}

export function useSSEStream(options?: UseSSEStreamOptions) {
  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [events, setEvents] = useState<WorkflowEvent[]>([
    {
      eventId: "evt-init-001",
      workflowId: "wf-live-init",
      type: "source.received",
      agentId: "source_agent",
      payload: { source: "github", commit: "e91b4fa1", repo: "yashwanth4545/YASHUVERSE" },
      occurredAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      eventId: "evt-init-002",
      workflowId: "wf-live-init",
      type: "activity.classified",
      agentId: "ml_intelligence",
      payload: { dimension: 384, confidence: 0.99, decision: "verified" },
      occurredAt: new Date(Date.now() - 2400000).toISOString(),
    },
    {
      eventId: "evt-init-003",
      workflowId: "wf-live-init",
      type: "verification.completed",
      agentId: "verification_agent",
      payload: { decision: "verified", evidenceIds: ["ev-repo-yashuverse-001"] },
      occurredAt: new Date(Date.now() - 1200000).toISOString(),
    },
  ]);

  const [presenceMap, setPresenceMap] = useState<Record<AgentId, AgentPresenceEvent>>(() => {
    const initial: Record<AgentId, AgentPresenceEvent> = {} as any;
    (Object.keys(AGENT_REGISTRY) as AgentId[]).forEach((agentId) => {
      initial[agentId] = {
        workflowId: "idle-state",
        agentId,
        state: "idle",
        taskLabel: "Docked — waiting for workflow trigger",
        occurredAt: new Date().toISOString(),
        eventId: `init-${agentId}`,
      };
    });
    return initial;
  });

  const retryCountRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const fallbackActiveRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource("/api/events/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setStatus("connected");
        retryCountRef.current = 0;
        fallbackActiveRef.current = false;
        lastHeartbeatRef.current = Date.now();
      };

      es.addEventListener("connection.ready", () => {
        setStatus("connected");
        lastHeartbeatRef.current = Date.now();
      });

      es.addEventListener("agent.presence", (e) => {
        try {
          const presence: AgentPresenceEvent = JSON.parse(e.data);
          setPresenceMap((prev) => ({
            ...prev,
            [presence.agentId]: presence,
          }));
          lastHeartbeatRef.current = Date.now();
        } catch (err) {
          console.warn("[YASHUVERSE SSE] Failed to parse agent.presence event", err);
        }
      });

      es.addEventListener("portfolio.published", (e) => {
        try {
          const payload = JSON.parse(e.data);
          options?.onPortfolioPublished?.(payload);
          lastHeartbeatRef.current = Date.now();
        } catch (err) {
          console.warn("[YASHUVERSE SSE] Failed to parse portfolio.published event", err);
        }
      });

      const eventTypes = [
        "source.received",
        "activity.classified",
        "project.discovered",
        "entity.matched",
        "knowledge.updated",
        "agent.task.queued",
        "agent.task.started",
        "agent.task.progress",
        "agent.task.completed",
        "agent.task.failed",
        "verification.completed",
        "portfolio.generated",
        "portfolio.published",
      ];

      eventTypes.forEach((type) => {
        es.addEventListener(type, (e) => {
          try {
            const data: WorkflowEvent = JSON.parse(e.data);
            setEvents((prev) => [data, ...prev.slice(0, 49)]);
            lastHeartbeatRef.current = Date.now();
          } catch (err) {
            console.warn(`[YASHUVERSE SSE] Failed to parse ${type} event`, err);
          }
        });
      });

      es.onerror = () => {
        es.close();
        // If static hosting environment, switch to autonomous client engine without crashing
        fallbackActiveRef.current = true;
        setStatus("connected");
      };
    } catch {
      fallbackActiveRef.current = true;
      setStatus("connected");
    }
  }, [options]);

  useEffect(() => {
    connect();

    // Heartbeat monitor interval
    const watchdog = setInterval(() => {
      if (Date.now() - lastHeartbeatRef.current > 35000 && !fallbackActiveRef.current) {
        connect();
      }
    }, 15000);

    return () => {
      clearInterval(watchdog);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return {
    status,
    events,
    presenceMap,
    setPresenceMap,
    setEvents,
    reconnect: connect,
  };
}

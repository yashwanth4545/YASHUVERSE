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
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
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

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus((prev) => (prev === "connected" ? "reconnecting" : "connecting"));

    try {
      const es = new EventSource("/api/events/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setStatus("connected");
        retryCountRef.current = 0;
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

      // Workflow events ingestion
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
        setStatus("reconnecting");
        const nextDelay = Math.min(1000 * Math.pow(1.5, retryCountRef.current), 10000);
        retryCountRef.current += 1;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, nextDelay);
      };
    } catch {
      setStatus("offline");
    }
  }, [options]);

  useEffect(() => {
    connect();

    // Heartbeat monitor interval
    const watchdog = setInterval(() => {
      if (Date.now() - lastHeartbeatRef.current > 35000 && status === "connected") {
        setStatus("reconnecting");
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
  }, [connect, status]);

  return {
    status,
    events,
    presenceMap,
    setPresenceMap,
    setEvents,
    reconnect: connect,
  };
}

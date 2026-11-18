import type { Response } from "express";

interface SSEClient {
  id: string;
  res: Response;
}

class EventBus {
  private clients: Map<string, SSEClient> = new Map();
  private eventHistory: Array<{ id: string; event: string; data: unknown; timestamp: number }> = [];
  private maxHistory = 200;

  public subscribe(clientId: string, res: Response, lastEventId?: string): void {
    this.clients.set(clientId, { id: clientId, res });

    // Send headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Replay missed events if client provided Last-Event-ID
    if (lastEventId) {
      const lastIndex = this.eventHistory.findIndex((e) => e.id === lastEventId);
      if (lastIndex !== -1) {
        for (let i = lastIndex + 1; i < this.eventHistory.length; i++) {
          const item = this.eventHistory[i];
          if (item) {
            res.write(`id: ${item.id}\nevent: ${item.event}\ndata: ${JSON.stringify(item.data)}\n\n`);
          }
        }
      }
    }
  }

  public unsubscribe(clientId: string): void {
    this.clients.delete(clientId);
  }

  public broadcast(eventName: string, data: unknown, customId?: string): void {
    const id = customId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record = { id, event: eventName, data, timestamp: Date.now() };

    this.eventHistory.push(record);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    const payload = `id: ${id}\nevent: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [clientId, client] of this.clients.entries()) {
      try {
        client.res.write(payload);
      } catch (err) {
        console.error(`Failed to push to client ${clientId}, removing:`, err);
        this.clients.delete(clientId);
      }
    }
  }

  public getHistory() {
    return this.eventHistory;
  }
}

export const eventBus = new EventBus();

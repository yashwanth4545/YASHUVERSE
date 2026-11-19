import crypto from "crypto";
import type { SourceEvent } from "@yashuverse/contracts";

export interface StoredSourceEvent {
  id: string;
  deliveryId: string;
  provider: "github" | "linkedin" | "document" | "manual";
  eventType: string;
  sourceUrl?: string;
  actor?: string;
  rawPayload: unknown;
  contentHash: string; // SHA-256
  status: "received" | "processing" | "processed" | "failed";
  receivedAt: string;
  processedAt?: string;
  errorMessage?: string;
  normalizedEvent: SourceEvent;
}

export class SourceEventStore {
  private events: Map<string, StoredSourceEvent> = new Map();
  private maxHistory: number;

  constructor(maxHistory = 1000) {
    this.maxHistory = maxHistory;
  }

  public recordEvent(
    deliveryId: string,
    eventType: string,
    rawPayload: unknown,
    normalized: SourceEvent,
    actor?: string,
    sourceUrl?: string
  ): StoredSourceEvent {
    // Compute SHA-256 hash over payload string
    const payloadStr = typeof rawPayload === "string" ? rawPayload : JSON.stringify(rawPayload);
    const contentHash = crypto.createHash("sha256").update(payloadStr).digest("hex");

    const record: StoredSourceEvent = {
      id: `se-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      deliveryId,
      provider: "github",
      eventType,
      sourceUrl: sourceUrl || normalized.sourceUrl,
      actor: actor || normalized.actor,
      rawPayload,
      contentHash,
      status: "received",
      receivedAt: new Date().toISOString(),
      normalizedEvent: normalized,
    };

    if (this.events.size >= this.maxHistory) {
      const oldestKey = this.events.keys().next().value;
      if (oldestKey) {
        this.events.delete(oldestKey);
      }
    }

    this.events.set(deliveryId, record);
    return record;
  }

  public getByDeliveryId(deliveryId: string): StoredSourceEvent | undefined {
    return this.events.get(deliveryId);
  }

  public updateStatus(deliveryId: string, status: StoredSourceEvent["status"], errorMessage?: string): void {
    const record = this.events.get(deliveryId);
    if (record) {
      record.status = status;
      if (status === "processed") {
        record.processedAt = new Date().toISOString();
      }
      if (errorMessage) {
        record.errorMessage = errorMessage;
      }
    }
  }

  public listRecent(limit = 50): StoredSourceEvent[] {
    return Array.from(this.events.values()).slice(-limit).reverse();
  }

  public clear(): void {
    this.events.clear();
  }
}

export const sourceEventStore = new SourceEventStore();

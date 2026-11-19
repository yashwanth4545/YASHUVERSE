/**
 * DeliveryIdempotencyStore
 * Prevents duplicate webhook delivery execution using in-memory LRU tracking
 * with backing support for source_events unique constraints.
 */

export interface DeliveryRecord {
  deliveryId: string;
  claimedAt: number;
  processed: boolean;
}

export class DeliveryIdempotencyStore {
  private deliveries: Map<string, DeliveryRecord> = new Map();
  private maxEntries: number;

  constructor(maxEntries = 2000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Attempts to claim a delivery ID atomically.
   * Returns true if the delivery is fresh and claimed.
   * Returns false if this deliveryId has already been claimed (duplicate).
   */
  public claim(deliveryId: string): boolean {
    if (!deliveryId || this.deliveries.has(deliveryId)) {
      return false; // Duplicate delivery
    }

    // Enforce max capacity
    if (this.deliveries.size >= this.maxEntries) {
      const oldestKey = this.deliveries.keys().next().value;
      if (oldestKey) {
        this.deliveries.delete(oldestKey);
      }
    }

    this.deliveries.set(deliveryId, {
      deliveryId,
      claimedAt: Date.now(),
      processed: false,
    });

    return true;
  }

  public isDuplicate(deliveryId: string): boolean {
    return this.deliveries.has(deliveryId);
  }

  public markProcessed(deliveryId: string): void {
    const record = this.deliveries.get(deliveryId);
    if (record) {
      record.processed = true;
    }
  }

  public size(): number {
    return this.deliveries.size;
  }

  public clear(): void {
    this.deliveries.clear();
  }
}

export const deliveryIdempotencyStore = new DeliveryIdempotencyStore();

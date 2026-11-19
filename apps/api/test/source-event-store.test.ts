import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { SourceEventStore } from "../src/services/source-event-store.js";
import type { SourceEvent } from "@yashuverse/contracts";

describe("YASHUVERSE Source Event Store & Provenance Suite", () => {
  let store: SourceEventStore;

  beforeEach(() => {
    store = new SourceEventStore(50);
  });

  test("Records source event with calculated SHA-256 content hash", () => {
    const deliveryId = "del-test-prov-001";
    const rawPayload = { action: "opened", repository: { full_name: "yashwanth4545/YASHUVERSE" } };
    const normalized: SourceEvent = {
      eventId: deliveryId,
      source: "github",
      eventType: "repository",
      actor: "yashwanth4545",
      occurredAt: new Date().toISOString(),
      content: "GitHub repository event",
      metadata: { rawPayload },
    };

    const record = store.recordEvent(
      deliveryId,
      "repository",
      rawPayload,
      normalized,
      "yashwanth4545",
      "https://github.com/yashwanth4545/YASHUVERSE"
    );

    assert.ok(record.id.startsWith("se-"));
    assert.equal(record.deliveryId, deliveryId);
    assert.equal(record.status, "received");
    assert.equal(record.contentHash.length, 64, "SHA-256 hash must be 64 characters");

    // Retrieve
    const fetched = store.getByDeliveryId(deliveryId);
    assert.ok(fetched);
    assert.equal(fetched.deliveryId, deliveryId);
  });

  test("Updates event status through ingestion lifecycle", () => {
    const deliveryId = "del-test-lifecycle-002";
    const normalized: SourceEvent = {
      eventId: deliveryId,
      source: "github",
      eventType: "push",
      occurredAt: new Date().toISOString(),
      content: "Push event",
      metadata: {},
    };

    store.recordEvent(deliveryId, "push", {}, normalized);
    store.updateStatus(deliveryId, "processing");
    assert.equal(store.getByDeliveryId(deliveryId)?.status, "processing");

    store.updateStatus(deliveryId, "processed");
    assert.equal(store.getByDeliveryId(deliveryId)?.status, "processed");
    assert.ok(store.getByDeliveryId(deliveryId)?.processedAt);
  });

  test("Records failure state with error message", () => {
    const deliveryId = "del-test-fail-003";
    const normalized: SourceEvent = {
      eventId: deliveryId,
      source: "github",
      eventType: "push",
      occurredAt: new Date().toISOString(),
      content: "Push event",
      metadata: {},
    };

    store.recordEvent(deliveryId, "push", {}, normalized);
    store.updateStatus(deliveryId, "failed", "API rate limit exceeded");

    const record = store.getByDeliveryId(deliveryId);
    assert.equal(record?.status, "failed");
    assert.equal(record?.errorMessage, "API rate limit exceeded");
  });
});

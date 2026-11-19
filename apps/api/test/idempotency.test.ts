import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { DeliveryIdempotencyStore } from "../src/services/idempotency-store.js";

describe("YASHUVERSE Delivery Idempotency Store Suite", () => {
  let store: DeliveryIdempotencyStore;

  beforeEach(() => {
    store = new DeliveryIdempotencyStore(10);
  });

  test("Allows first delivery ID claim and flags duplicate as rejected", () => {
    const deliveryId = "del-gh-unique-001";
    assert.equal(store.claim(deliveryId), true, "First claim must be accepted");
    assert.equal(store.claim(deliveryId), false, "Duplicate claim must be rejected");
    assert.equal(store.isDuplicate(deliveryId), true);
  });

  test("Rejects empty or undefined delivery ID", () => {
    assert.equal(store.claim(""), false);
  });

  test("Maintains processed flag upon completion", () => {
    const deliveryId = "del-gh-unique-002";
    store.claim(deliveryId);
    store.markProcessed(deliveryId);
    assert.equal(store.isDuplicate(deliveryId), true);
  });

  test("Evicts oldest delivery when capacity limit is reached", () => {
    for (let i = 1; i <= 10; i++) {
      store.claim(`del-${i}`);
    }
    assert.equal(store.size(), 10);

    // Adding 11th should evict del-1
    store.claim("del-11");
    assert.equal(store.isDuplicate("del-1"), false, "del-1 should have been evicted");
    assert.equal(store.isDuplicate("del-11"), true);
  });
});

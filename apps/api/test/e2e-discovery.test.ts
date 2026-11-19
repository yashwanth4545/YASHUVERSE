import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import http from "http";
import express from "express";
import { verifyHmacSignature } from "../src/verify-hmac.js";
import { DeliveryIdempotencyStore } from "../src/services/idempotency-store.js";
import { SourceEventStore } from "../src/services/source-event-store.js";
import type { SourceEvent } from "@yashuverse/contracts";

describe("YASHUVERSE GitHub Autonomous Discovery Engine - E2E Integration Suite", () => {
  const secret = "test-e2e-secret-key-32-chars-ok";
  let server: http.Server;
  let baseUrl: string;
  let testIdempotencyStore: DeliveryIdempotencyStore;
  let testSourceStore: SourceEventStore;

  before(async () => {
    testIdempotencyStore = new DeliveryIdempotencyStore();
    testSourceStore = new SourceEventStore();

    const app = express();
    app.use(
      express.json({
        verify: (req: any, _res, buf) => {
          req.rawBody = buf;
        },
      })
    );

    app.post("/test/webhooks/github", (req: any, res: any) => {
      const signature = req.headers["x-hub-signature-256"] as string | undefined;
      const deliveryId = req.headers["x-github-delivery"] as string | undefined;
      const eventName = req.headers["x-github-event"] as string | undefined;

      if (!signature) return res.status(401).json({ error: "Missing signature" });
      if (!deliveryId) return res.status(400).json({ error: "Missing delivery ID" });

      const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
      if (!verifyHmacSignature(rawBody, signature, secret)) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      if (eventName === "ping") {
        return res.status(200).json({ status: "pong" });
      }

      const isClaimed = testIdempotencyStore.claim(deliveryId);
      if (!isClaimed) {
        return res.status(200).json({ status: "ignored_duplicate", deliveryId });
      }

      const normalized: SourceEvent = {
        eventId: deliveryId,
        source: "github",
        eventType: eventName || "push",
        actor: req.body?.sender?.login || "test-user",
        occurredAt: new Date().toISOString(),
        content: `Event on ${req.body?.repository?.full_name}`,
        metadata: { deliveryId, rawPayload: req.body },
      };

      testSourceStore.recordEvent(deliveryId, eventName || "push", req.body, normalized);

      return res.status(202).json({
        status: "accepted",
        deliveryId,
        event: eventName,
      });
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test("1. Rejects request without HMAC signature with 401", async () => {
    const res = await fetch(`${baseUrl}/test/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Delivery": "del-001",
        "X-GitHub-Event": "push",
      },
      body: JSON.stringify({ ref: "refs/heads/main" }),
    });

    assert.equal(res.status, 401);
  });

  test("2. Rejects request with corrupted signature with 401", async () => {
    const payload = JSON.stringify({ ref: "refs/heads/main" });
    const res = await fetch(`${baseUrl}/test/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Delivery": "del-002",
        "X-GitHub-Event": "push",
        "X-Hub-Signature-256": "sha256=invalid000000000000000000000000000000000000000000000000000000000000",
      },
      body: payload,
    });

    assert.equal(res.status, 401);
  });

  test("3. Rejects request missing X-GitHub-Delivery with 400", async () => {
    const payload = JSON.stringify({ ref: "refs/heads/main" });
    const hmac = crypto.createHmac("sha256", secret).update(Buffer.from(payload)).digest("hex");

    const res = await fetch(`${baseUrl}/test/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": "push",
        "X-Hub-Signature-256": `sha256=${hmac}`,
      },
      body: payload,
    });

    assert.equal(res.status, 400);
  });

  test("4. Accepts valid signed webhook, stores event and returns 202 Accepted", async () => {
    const deliveryId = "del-valid-e2e-100";
    const payload = JSON.stringify({
      ref: "refs/heads/main",
      repository: { full_name: "yashwanth4545/YASHUVERSE" },
      sender: { login: "yashwanth4545" },
    });
    const hmac = crypto.createHmac("sha256", secret).update(Buffer.from(payload)).digest("hex");

    const res = await fetch(`${baseUrl}/test/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Delivery": deliveryId,
        "X-GitHub-Event": "push",
        "X-Hub-Signature-256": `sha256=${hmac}`,
      },
      body: payload,
    });

    assert.equal(res.status, 202);
    const data = await res.json();
    assert.equal(data.status, "accepted");
    assert.equal(data.deliveryId, deliveryId);

    // Verify stored event in source event store
    const stored = testSourceStore.getByDeliveryId(deliveryId);
    assert.ok(stored);
    assert.equal(stored.deliveryId, deliveryId);
    assert.equal(stored.actor, "yashwanth4545");
  });

  test("5. Idempotency gate: Duplicate webhook delivery is safely ignored with 200 OK", async () => {
    const deliveryId = "del-duplicate-e2e-200";
    const payload = JSON.stringify({ repository: { full_name: "yashwanth4545/YASHUVERSE" } });
    const hmac = crypto.createHmac("sha256", secret).update(Buffer.from(payload)).digest("hex");

    // First attempt: Accepted
    const res1 = await fetch(`${baseUrl}/test/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Delivery": deliveryId,
        "X-GitHub-Event": "repository",
        "X-Hub-Signature-256": `sha256=${hmac}`,
      },
      body: payload,
    });
    assert.equal(res1.status, 202);

    // Second attempt with identical deliveryId: Ignored Duplicate
    const res2 = await fetch(`${baseUrl}/test/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Delivery": deliveryId,
        "X-GitHub-Event": "repository",
        "X-Hub-Signature-256": `sha256=${hmac}`,
      },
      body: payload,
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.status, "ignored_duplicate");
  });

  test("6. Ping event returns 200 pong", async () => {
    const payload = JSON.stringify({ zen: "Responsive is better than fast.", hook_id: 1234 });
    const hmac = crypto.createHmac("sha256", secret).update(Buffer.from(payload)).digest("hex");

    const res = await fetch(`${baseUrl}/test/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Delivery": "del-ping-300",
        "X-GitHub-Event": "ping",
        "X-Hub-Signature-256": `sha256=${hmac}`,
      },
      body: payload,
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "pong");
  });
});

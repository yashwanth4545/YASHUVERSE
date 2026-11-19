import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import express from "express";
import { defaultMLClient } from "@yashuverse/worker";

describe("YASHUVERSE API - ML Intelligence REST Endpoints", () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const app = express();
    app.use(express.json());

    app.post("/api/ml/classify", async (req: any, res: any) => {
      try {
        const { text, metadata } = req.body || {};
        if (!text) return res.status(400).json({ error: "Missing required 'text' field" });
        const result = await defaultMLClient.classifyActivity(text, metadata || {});
        res.json(result);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/ml/embed", async (req: any, res: any) => {
      try {
        const { text } = req.body || {};
        if (!text) return res.status(400).json({ error: "Missing required 'text' field" });
        const result = await defaultMLClient.embedText(text);
        res.json(result);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/ml/match", async (req: any, res: any) => {
      try {
        const { candidate, existingCatalog } = req.body || {};
        if (!candidate) return res.status(400).json({ error: "Missing required 'candidate' project" });
        const result = await defaultMLClient.matchEntities(candidate, existingCatalog || []);
        res.json(result);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/ml/verify", async (req: any, res: any) => {
      try {
        const { claim, evidence } = req.body || {};
        if (!claim) return res.status(400).json({ error: "Missing required 'claim' object" });
        const result = await defaultMLClient.verifyClaim(claim, evidence || []);
        res.json(result);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("POST /api/ml/classify should return 200 with calibrated prediction", async () => {
    const res = await fetch(`${baseUrl}/api/ml/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Refactor architecture pipeline and update schema",
      }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.predictedLabel, "ARCHITECTURE_REFACTOR");
    assert.ok(body.calibratedScore >= 0.7);
  });

  it("POST /api/ml/classify should return 400 when text is missing", async () => {
    const res = await fetch(`${baseUrl}/api/ml/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
  });

  it("POST /api/ml/embed should return 200 with 384-dimensional vector", async () => {
    const res = await fetch(`${baseUrl}/api/ml/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Semantic pgvector vector embedding search" }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.dimension, 384);
    assert.equal(body.embedding.length, 384);
  });

  it("POST /api/ml/match should return duplicate decision for matching repo URL", async () => {
    const res = await fetch(`${baseUrl}/api/ml/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate: { repoUrl: "https://github.com/yashwanth4545/portfolio" },
        existingCatalog: [{ entityId: "proj-1", repoUrl: "https://github.com/yashwanth4545/portfolio" }],
      }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.decision, "duplicate_merge");
    assert.equal(body.matchedEntityId, "proj-1");
  });

  it("POST /api/ml/verify should block claim without evidence IDs", async () => {
    const res = await fetch(`${baseUrl}/api/ml/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claim: { claimId: "c-101", claimText: "Invented new programming language", evidenceIds: [] },
        evidence: [],
      }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.verificationStatus, "blocked");
    assert.equal(body.policyAction, "SUPPRESS_FROM_PUBLIC_PORTFOLIO");
  });
});

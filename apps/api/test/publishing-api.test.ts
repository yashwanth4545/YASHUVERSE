import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import express from "express";
import {
  defaultPublishingEngine,
  defaultSeoGenerator,
} from "@yashuverse/worker";
import { INITIAL_PORTFOLIO } from "@yashuverse/portfolio-schema";

describe("YASHUVERSE API - Phase 5 Publishing & SEO Endpoints", () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const app = express();
    app.use(express.json());

    // Versions History
    app.get("/api/portfolio/versions", (_req: any, res: any) => {
      const allSnapshots = defaultPublishingEngine.getAllVersions();
      const activeSnapshot = defaultPublishingEngine.getActiveVersion();
      res.json({
        activeVersion: activeSnapshot?.version || 1,
        versions: allSnapshots,
      });
    });

    // Atomic Rollback Endpoint
    app.post("/api/portfolio/rollback/:version", async (req: any, res: any) => {
      const targetVer = parseInt(req.params.version, 10);
      if (isNaN(targetVer)) {
        return res.status(400).json({ error: "Invalid version number" });
      }
      const result = await defaultPublishingEngine.rollbackVersion(targetVer);
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }
      res.json(result);
    });

    // SEO Metadata Endpoint
    app.get("/api/portfolio/seo", (_req: any, res: any) => {
      const active = defaultPublishingEngine.getActiveVersion();
      const currentDoc = active?.content || INITIAL_PORTFOLIO;
      const seo = defaultSeoGenerator.generateSeoMetadata(currentDoc);
      res.json(seo);
    });

    // Dynamic XML Sitemap
    app.get("/sitemap.xml", (_req: any, res: any) => {
      const xml = defaultSeoGenerator.generateSitemapXml();
      res.setHeader("Content-Type", "application/xml");
      res.send(xml);
    });

    // Robots.txt
    app.get("/robots.txt", (_req: any, res: any) => {
      const txt = defaultSeoGenerator.generateRobotsTxt();
      res.setHeader("Content-Type", "text/plain");
      res.send(txt);
    });

    // Publishing Audit Trail
    app.get("/api/publish/audit", (_req: any, res: any) => {
      const logs = defaultPublishingEngine.getAuditLogs();
      res.json({ count: logs.length, logs });
    });

    // Notifications
    app.get("/api/notifications", (_req: any, res: any) => {
      const notifications = defaultPublishingEngine.getNotifications();
      res.json({ count: notifications.length, notifications });
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

  it("GET /api/portfolio/versions should return version history list", async () => {
    const res = await fetch(`${baseUrl}/api/portfolio/versions`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.activeVersion);
    assert.ok(Array.isArray(body.versions));
  });

  it("GET /api/portfolio/seo should return OpenGraph & JSON-LD metadata", async () => {
    const res = await fetch(`${baseUrl}/api/portfolio/seo`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.title.includes("YASHUVERSE"));
    assert.equal(body.canonicalUrl, "https://yashwanthreddyg-portfolio.web.app");
    assert.equal(body.jsonLd["@type"], "ProfilePage");
  });

  it("GET /sitemap.xml should return valid XML response", async () => {
    const res = await fetch(`${baseUrl}/sitemap.xml`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get("content-type")?.includes("xml"));
    const text = await res.text();
    assert.ok(text.includes("<urlset"));
    assert.ok(text.includes("https://yashwanthreddyg-portfolio.web.app/"));
  });

  it("GET /robots.txt should return text directives referencing sitemap", async () => {
    const res = await fetch(`${baseUrl}/robots.txt`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes("User-agent: *"));
    assert.ok(text.includes("Sitemap:"));
  });

  it("GET /api/publish/audit and /api/notifications should return audit logs", async () => {
    const resAudit = await fetch(`${baseUrl}/api/publish/audit`);
    assert.equal(resAudit.status, 200);
    const auditBody = (await resAudit.json()) as any;
    assert.ok(Array.isArray(auditBody.logs));

    const resNotif = await fetch(`${baseUrl}/api/notifications`);
    assert.equal(resNotif.status, 200);
    const notifBody = (await resNotif.json()) as any;
    assert.ok(Array.isArray(notifBody.notifications));
  });

  it("POST /api/portfolio/rollback/:version should reject invalid version", async () => {
    const res = await fetch(`${baseUrl}/api/portfolio/rollback/99999`, { method: "POST" });
    assert.equal(res.status, 404);
  });
});

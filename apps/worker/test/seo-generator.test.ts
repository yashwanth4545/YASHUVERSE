import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SeoGenerator } from "../src/publishing/seo-generator.js";
import { INITIAL_PORTFOLIO } from "@yashuverse/portfolio-schema";

describe("YASHUVERSE Phase 5 - SEO & Sitemap Generator", () => {
  const generator = new SeoGenerator();

  it("should generate comprehensive SEO metadata conforming to Schema.org standards", () => {
    const seo = generator.generateSeoMetadata(INITIAL_PORTFOLIO, "https://yashwanthreddyg-portfolio.web.app");

    assert.ok(seo.title.includes("Yashwanth Reddy G"));
    assert.ok(seo.title.includes("YASHUVERSE"));
    assert.equal(seo.canonicalUrl, "https://yashwanthreddyg-portfolio.web.app");
    assert.equal(seo.ogType, "profile");
    assert.equal(seo.twitterCard, "summary_large_image");
    assert.ok(seo.keywords.length >= 4);

    // Schema.org JSON-LD Verification
    assert.equal(seo.jsonLd["@context"], "https://schema.org");
    assert.equal(seo.jsonLd["@type"], "ProfilePage");

    const person = seo.jsonLd["mainEntity"] as any;
    assert.ok(person);
    assert.equal(person["@type"], "Person");
    assert.equal(person.name, "Yashwanth Reddy G");
    assert.ok(Array.isArray(person.knowsAbout));
  });

  it("should generate valid XML sitemap with correct namespaces and URL entries", () => {
    const xml = generator.generateSitemapXml("https://yashwanthreddyg-portfolio.web.app");

    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    assert.ok(xml.includes("<loc>https://yashwanthreddyg-portfolio.web.app/</loc>"));
    assert.ok(xml.includes("<loc>https://yashwanthreddyg-portfolio.web.app/portfolio</loc>"));
    assert.ok(xml.includes("<loc>https://yashwanthreddyg-portfolio.web.app/workspace</loc>"));
    assert.ok(xml.endsWith("</urlset>"));
  });

  it("should generate valid robots.txt directives referencing the sitemap", () => {
    const robots = generator.generateRobotsTxt("https://yashwanthreddyg-portfolio.web.app");

    assert.ok(robots.includes("User-agent: *"));
    assert.ok(robots.includes("Allow: /"));
    assert.ok(robots.includes("Sitemap: https://yashwanthreddyg-portfolio.web.app/sitemap.xml"));
  });
});

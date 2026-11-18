import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_PORTFOLIO,
  validatePortfolioDocument,
  PortfolioDocumentSchema,
  ProjectGridSectionSchema,
} from "../src/index.js";

describe("YASHUVERSE Portfolio Schema & Security Constraints", () => {
  test("Validates baseline initial portfolio document successfully", () => {
    const result = validatePortfolioDocument(INITIAL_PORTFOLIO);
    assert.equal(result.success, true);
    assert.equal(result.data?.profile.name, "Yashwanth Reddy G");
    assert.equal(result.data?.sections.length, 5);
  });

  test("Rejects unapproved / malicious component types", () => {
    const maliciousSection = {
      id: "malicious-code",
      type: "arbitrary-executable-component", // NOT in whitelist
      title: "Exploit attempt",
      items: [],
    };

    const invalidPortfolio = {
      ...INITIAL_PORTFOLIO,
      sections: [maliciousSection],
    };

    const result = validatePortfolioDocument(invalidPortfolio);
    assert.equal(result.success, false);
    assert.ok(result.errors);
  });

  test("Enforces evidenceIds provenance on every project item", () => {
    const projectWithoutEvidence = {
      id: "unverified-projects",
      type: "project-grid" as const,
      title: "Unverified Projects",
      visible: true,
      items: [
        {
          entityId: "fake-proj",
          title: "Fake Project Without Evidence",
          description: "This project has no evidence provenance attached",
          technologies: ["Node.js"],
          evidenceIds: [], // Empty evidence array must be rejected!
          verified: true,
          status: "active" as const,
          featured: false,
        },
      ],
    };

    const parseResult = ProjectGridSectionSchema.safeParse(projectWithoutEvidence);
    assert.equal(parseResult.success, false, "Must reject project items with empty evidenceIds");
  });

  test("Requires valid URLs for github and live links", () => {
    const invalidUrlProject = {
      entityId: "test-proj",
      title: "Test Project",
      description: "Valid description",
      technologies: ["TypeScript"],
      githubUrl: "not-a-valid-url", // invalid URL
      evidenceIds: ["ev-001"],
      verified: true,
      status: "active" as const,
      featured: false,
    };

    const parseResult = ProjectGridSectionSchema.safeParse({
      id: "test-grid",
      type: "project-grid",
      title: "Test",
      visible: true,
      items: [invalidUrlProject],
    });

    assert.equal(parseResult.success, false, "Must reject invalid URL formats");
  });

  test("Validates all 5 approved component whitelist types in discriminated union", () => {
    const expectedTypes = [
      "project-grid",
      "achievement-timeline",
      "skill-cloud",
      "experience-list",
      "activity-feed",
    ];

    const actualTypes = INITIAL_PORTFOLIO.sections.map((s) => s.type);
    for (const expected of expectedTypes) {
      assert.ok(actualTypes.includes(expected as any), `Missing whitelist component type: ${expected}`);
    }
  });
});

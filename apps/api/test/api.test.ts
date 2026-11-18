import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { verifyHmacSignature } from "../src/verify-hmac.js";

describe("YASHUVERSE Express API Integration Suite", () => {
  const secret = "test-webhook-secret-key-32-chars";
  const body = JSON.stringify({ action: "opened", repository: { name: "yashuverse" } });

  test("Validates authentic HMAC-SHA256 signature", () => {
    const validHmac = crypto.createHmac("sha256", secret).update(Buffer.from(body)).digest("hex");
    const validSignature = `sha256=${validHmac}`;

    assert.equal(verifyHmacSignature(body, validSignature, secret), true);
  });

  test("Rejects mismatched or tampered payload signature", () => {
    const validHmac = crypto.createHmac("sha256", secret).update(Buffer.from(body)).digest("hex");
    const validSignature = `sha256=${validHmac}`;
    const tamperedBody = JSON.stringify({ action: "opened", repository: { name: "attacker-repo" } });

    assert.equal(verifyHmacSignature(tamperedBody, validSignature, secret), false);
  });

  test("Rejects missing or invalid signature formats safely without throwing", () => {
    assert.equal(verifyHmacSignature(body, undefined, secret), false);
    assert.equal(verifyHmacSignature(body, "sha256=invalid-length", secret), false);
  });
});

import crypto from "crypto";

export function verifyHmacSignature(rawBody: Buffer | string, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  const expectedSignature = `sha256=${crypto.createHmac("sha256", secret).update(bodyBuffer).digest("hex")}`;

  const sigBuffer = Buffer.from(signatureHeader);
  const expBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expBuffer);
}

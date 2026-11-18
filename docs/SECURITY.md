# YASHUVERSE — Security & Reliability Guidelines

## 1. Secrets & Environmental Boundary
- All API tokens, GitHub webhook secrets, OAuth client secrets, and database credentials must remain strictly server-side.
- The React web client (`apps/web`) receives only sanitized, validated JSON payloads. No environment secrets or private tokens are bundled.

## 2. Ingestion Defense & Untrusted Data
- Inbound READMEs, commit messages, and uploaded PDF documents are treated as **untrusted user input**.
- Agents strictly defend against prompt injection: agent execution prompts never obey instructions embedded in source documents.
- Agents never execute arbitrary shell commands or generate executable browser code. Output is strictly bounded by Zod schemas.

## 3. GitHub Webhook Verification
- Webhook endpoints verify `X-Hub-Signature-256` using HMAC-SHA256 over raw request buffers.
- Verification uses `crypto.timingSafeEqual` to eliminate timing attack vectors.
- Webhook deliveries enforce idempotency via unique constraints on `(provider, delivery_id)`.

## 4. LinkedIn API Policy & Fallbacks
- YASHUVERSE integrates only with officially approved LinkedIn OAuth scopes.
- Standard member login does not grant post-reading permissions; scraping or bypassing LinkedIn access controls is strictly prohibited.
- When post-reading scopes are unavailable, YASHUVERSE provides manual URL/text ingestion and certified document upload fallbacks.

## 5. Provenance & Claim Verification Policy
- Every public assertion (employment, project authorship, skills, certifications) requires explicit link to an evidence identifier in `knowledge_facts`.
- High-impact claims (employment, ownership, awards) require strict review policies; confidence scores alone do not permit automated publishing.

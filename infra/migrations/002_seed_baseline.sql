-- ====================================================================
-- YASHUVERSE DATABASE SCHEMA: MIGRATION 002_SEED_BASELINE.SQL
-- Seed verified baseline records for Yashwanth Reddy G
-- ====================================================================

-- 1. Insert Initial Model Registry Baseline
INSERT INTO model_registry (
    model_version, task_name, artifact_path, train_metrics, eval_metrics, f1_score, is_active, deployed_at
) VALUES (
    'ml-activity-clf-v1.0.0',
    'activity_classification',
    'services/ml/models/activity_clf_v1.joblib',
    '{"train_samples": 450, "loss": 0.082}'::jsonb,
    '{"test_samples": 120, "precision": 0.942, "recall": 0.938, "f1": 0.940, "fpr": 0.021}'::jsonb,
    0.940,
    TRUE,
    NOW()
) ON CONFLICT (model_version) DO NOTHING;

-- 2. Insert Initial Source Connections (Demonstrating verified states)
INSERT INTO source_connections (
    provider, provider_account_id, display_name, granted_scopes, status
) VALUES 
('github', 'yashwanthreddy-g', 'yashwanthreddy-g (GitHub)', ARRAY['read:user', 'repo:status', 'public_repo'], 'connected'),
('linkedin', 'yashwanthreddy-g', 'Yashwanth Reddy G (LinkedIn)', ARRAY['openid', 'profile', 'email'], 'limited'),
('document', 'doc-resume-2026', 'Yashwanth_Reddy_G_Resume_2026.pdf', ARRAY['file:read'], 'connected')
ON CONFLICT (provider, provider_account_id) DO NOTHING;

-- 3. Insert Initial Canonical Project Entities
INSERT INTO entities (
    entity_id, entity_type, canonical_name, summary, properties, confidence, status
) VALUES 
(
    'proj-yashuverse-core',
    'project',
    'YASHUVERSE Autonomous Portfolio Engine',
    'Flagship multi-agent autonomous portfolio engine with live cursors and cryptographic claim verification.',
    '{"technologies": ["React", "TypeScript", "Three.js", "Express", "FastAPI", "scikit-learn", "Supabase"]}'::jsonb,
    0.990,
    'active'
),
(
    'proj-neuro-sync-rag',
    'project',
    'NeuroSync: Calibrated RAG & Knowledge Graph Engine',
    'Production-grade retrieval engine combining dense vector search and sparse BM25 with calibrated confidence scoring.',
    '{"technologies": ["Python", "FastAPI", "PyTorch", "Sentence-Transformers", "PostgreSQL", "pgvector"]}'::jsonb,
    0.960,
    'active'
),
(
    'proj-lost-found-hub',
    'project',
    'Campus Hub & Distributed State Engine',
    'High-concurrency community platform featuring real-time event streaming and role-based access control.',
    '{"technologies": ["React", "Node.js", "Tailwind CSS", "Supabase", "Redis"]}'::jsonb,
    0.940,
    'active'
)
ON CONFLICT (entity_id) DO NOTHING;

-- 4. Insert Verified Facts with Provenance
INSERT INTO knowledge_facts (
    entity_id, claim_type, claim_text, evidence_ids, confidence_score, verification_status, policy_decision_notes, verified_at
) 
SELECT 
    id,
    'repository',
    'YASHUVERSE Autonomous Portfolio Engine is authored by Yashwanth Reddy G',
    ARRAY['ev-repo-yashuverse-001', 'ev-commit-init-002'],
    0.990,
    'verified',
    'Confirmed author identity matches verified git commit signature.',
    NOW()
FROM entities WHERE entity_id = 'proj-yashuverse-core';

-- 5. Insert Immutable Portfolio Snapshot (v1)
INSERT INTO portfolio_versions (
    version_number,
    checksum,
    is_active,
    content_json,
    audit_hash,
    created_by_workflow,
    published_at
) VALUES (
    1,
    'sha256-e91b4fa1807d9f2a74c6d3bc8945f061',
    TRUE,
    '{"version": 1, "profile": {"name": "Yashwanth Reddy G", "status": "Designing Autonomous AI Systems"}}'::jsonb,
    '0x7F4A992C',
    'wf-init-bootstrap-001',
    NOW()
) ON CONFLICT (version_number) DO UPDATE SET is_active = TRUE;

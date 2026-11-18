-- ====================================================================
-- YASHUVERSE DATABASE SCHEMA: MIGRATION 001_INITIAL_SCHEMA.SQL
-- Supabase PostgreSQL + pgvector Schema definition conforming to
-- YASHUVERSE Master Blueprint Section 9 & 10.
-- ====================================================================

-- Enable UUID extension and Vector extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Enable when pgvector is loaded in Supabase

-- 1. SOURCE_CONNECTIONS
-- Tracks connected OAuth providers (GitHub App, LinkedIn with approved scopes, manual)
CREATE TABLE IF NOT EXISTS source_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL, -- 'github' | 'linkedin' | 'document' | 'manual'
    provider_account_id VARCHAR(255),
    display_name VARCHAR(255),
    granted_scopes TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'disconnected', -- 'connected' | 'limited' | 'disconnected' | 'revoked'
    sync_cursor TEXT,
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_provider_account UNIQUE (provider, provider_account_id)
);

-- 2. SOURCE_EVENTS
-- Append-only raw event store with idempotency on provider delivery ID
CREATE TABLE IF NOT EXISTS source_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id VARCHAR(255) NOT NULL, -- X-GitHub-Delivery or generated hash
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    source_url TEXT,
    actor VARCHAR(255),
    raw_payload JSONB NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256
    status VARCHAR(50) NOT NULL DEFAULT 'received', -- 'received' | 'processing' | 'processed' | 'failed'
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_source_delivery UNIQUE (provider, delivery_id)
);

CREATE INDEX IF NOT EXISTS idx_source_events_status ON source_events (status);
CREATE INDEX IF NOT EXISTS idx_source_events_hash ON source_events (content_hash);

-- 3. SOURCE_ARTIFACTS
-- Stores documents, extracted READMEs, certificates, commit diffs
CREATE TABLE IF NOT EXISTS source_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_event_id UUID REFERENCES source_events(id) ON DELETE SET NULL,
    artifact_type VARCHAR(50) NOT NULL, -- 'readme' | 'resume' | 'certificate' | 'commit_summary'
    source_url TEXT,
    storage_path TEXT,
    content_text TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    provenance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_artifacts_hash ON source_artifacts (content_hash);

-- 4. ENTITIES
-- Canonical discovered entities (projects, skills, experiences, achievements)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'proj-yashuverse-core'
    entity_type VARCHAR(50) NOT NULL, -- 'project' | 'skill' | 'experience' | 'achievement'
    canonical_name VARCHAR(255) NOT NULL,
    summary TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.000,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'candidate' | 'active' | 'merged' | 'archived'
    merged_into_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities (entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities (status);

-- 5. ENTITY_SOURCES
-- Provenance link connecting canonical entities to underlying source events & artifacts
CREATE TABLE IF NOT EXISTS entity_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    source_event_id UUID REFERENCES source_events(id) ON DELETE CASCADE,
    source_artifact_id UUID REFERENCES source_artifacts(id) ON DELETE CASCADE,
    match_confidence NUMERIC(4,3) NOT NULL,
    match_method VARCHAR(100) NOT NULL, -- 'exact_repo_match' | 'vector_similarity' | 'ngram_matching'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. KNOWLEDGE_FACTS
-- Individual atomic public claims with explicit evidence linkage
CREATE TABLE IF NOT EXISTS knowledge_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    claim_type VARCHAR(50) NOT NULL, -- 'repository' | 'technology' | 'role' | 'achievement' | 'ownership'
    claim_text TEXT NOT NULL,
    evidence_ids TEXT[] NOT NULL DEFAULT '{}',
    confidence_score NUMERIC(4,3) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'candidate', -- 'candidate' | 'verified' | 'review_required' | 'blocked'
    policy_decision_notes TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_facts_status ON knowledge_facts (verification_status);

-- 7. ML_PREDICTIONS
-- Audit log of all model classifications, entity resolutions and confidence calculations
CREATE TABLE IF NOT EXISTS ml_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version VARCHAR(50) NOT NULL,
    task_name VARCHAR(100) NOT NULL, -- 'activity_classification' | 'project_discovery' | 'claim_confidence'
    input_hash VARCHAR(64) NOT NULL,
    features_used JSONB,
    predicted_label VARCHAR(100),
    confidence_score NUMERIC(4,3) NOT NULL,
    calibrated_score NUMERIC(4,3),
    human_correction VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AGENT_RUNS
-- Orchestrated workflows and task executions with compute/token accounting
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(100) NOT NULL,
    agent_id VARCHAR(50) NOT NULL, -- 'source_agent' | 'project_agent' | 'verification_agent' ...
    task_type VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued' | 'working' | 'completed' | 'failed' | 'blocked'
    input_payload JSONB NOT NULL,
    output_payload JSONB,
    error_details JSONB,
    retry_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_workflow ON agent_runs (workflow_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs (status);

-- 9. AGENT_EVENTS
-- Real-time cursor state, task progress, and target tracking events
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) NOT NULL UNIQUE,
    workflow_id VARCHAR(100) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL, -- 'idle' | 'queued' | 'working' | 'completed' | 'blocked' | 'failed'
    task_label TEXT NOT NULL,
    target_id VARCHAR(100), -- DOM element identifier on canvas
    progress INT, -- measured 0-100 only
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_events_workflow ON agent_events (workflow_id, occurred_at);

-- 10. PORTFOLIO_VERSIONS
-- Immutable published portfolio snapshots
CREATE TABLE IF NOT EXISTS portfolio_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_number INT NOT NULL UNIQUE,
    checksum VARCHAR(64) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    content_json JSONB NOT NULL,
    audit_hash VARCHAR(64) NOT NULL,
    created_by_workflow VARCHAR(100),
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_versions_active ON portfolio_versions (is_active);

-- 11. PUBLISH_LOGS
-- Comprehensive audit trail of all candidate validations, policy decisions, and atomic swaps
CREATE TABLE IF NOT EXISTS publish_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_checksum VARCHAR(64) NOT NULL,
    target_version_number INT NOT NULL,
    policy_check_passed BOOLEAN NOT NULL,
    policy_summary JSONB NOT NULL,
    transaction_status VARCHAR(50) NOT NULL, -- 'success' | 'rolled_back' | 'rejected'
    previous_version_number INT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. REVIEW_QUEUE
-- Human-in-the-loop triage for ambiguous or high-impact candidate claims
CREATE TABLE IF NOT EXISTS review_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fact_id UUID REFERENCES knowledge_facts(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    proposed_change TEXT NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL,
    evidence_ids TEXT[] NOT NULL DEFAULT '{}',
    review_reason TEXT NOT NULL, -- e.g. 'unsupported_employment_claim' | 'ambiguous_ownership'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. MODEL_REGISTRY
-- Governed store of trained model weights, evaluation metrics, and active deployment status
CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version VARCHAR(50) NOT NULL UNIQUE,
    task_name VARCHAR(100) NOT NULL,
    artifact_path TEXT NOT NULL,
    train_metrics JSONB NOT NULL,
    eval_metrics JSONB NOT NULL,
    f1_score NUMERIC(4,3) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE portfolio_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_facts ENABLE ROW LEVEL SECURITY;

-- Public can read active portfolio version
CREATE POLICY public_read_active_portfolio ON portfolio_versions
    FOR SELECT USING (is_active = true);

-- Public can read live agent events
CREATE POLICY public_read_agent_events ON agent_events
    FOR SELECT USING (true);

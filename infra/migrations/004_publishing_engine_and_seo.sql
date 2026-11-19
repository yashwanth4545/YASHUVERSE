-- ====================================================================
-- YASHUVERSE DATABASE SCHEMA: MIGRATION 004_PUBLISHING_ENGINE_AND_SEO.SQL
-- Phase 5: Autonomous Portfolio Intelligence, SEO Metadata & Atomic Swaps
-- ====================================================================

-- 1. Enhance PORTFOLIO_VERSIONS Table
ALTER TABLE portfolio_versions
    ADD COLUMN IF NOT EXISTS seo_metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS changelog_summary TEXT,
    ADD COLUMN IF NOT EXISTS published_by VARCHAR(50) NOT NULL DEFAULT 'publishing_agent',
    ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50) NOT NULL DEFAULT 'event_driven',
    ADD COLUMN IF NOT EXISTS approval_ticket_id VARCHAR(100);

-- 2. PUBLISHING_AUDIT_LOG Table
-- Immutable audit log tracking every candidate generation, validation gate, and atomic swap
CREATE TABLE IF NOT EXISTS publishing_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id VARCHAR(100) NOT NULL UNIQUE,
    version_number INT NOT NULL,
    previous_version INT,
    candidate_checksum VARCHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success' | 'skipped_duplicate' | 'approval_required' | 'rolled_back' | 'rejected' | 'failed'
    trigger_type VARCHAR(50) NOT NULL, -- 'event_driven' | 'scheduled' | 'manual'
    policy_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    quality_score NUMERIC(4,3) NOT NULL DEFAULT 0.000,
    evidence_ids TEXT[] NOT NULL DEFAULT '{}',
    duration_ms INT NOT NULL DEFAULT 0,
    error_message TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publishing_audit_status ON publishing_audit_log (status);
CREATE INDEX IF NOT EXISTS idx_publishing_audit_version ON publishing_audit_log (version_number);

-- 3. NOTIFICATIONS Table
-- Real-time notifications and alerts for deployment, security blocks, and pending approvals
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id VARCHAR(100) NOT NULL UNIQUE,
    notification_type VARCHAR(50) NOT NULL,
    workflow_id VARCHAR(100),
    version_number INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info' | 'warning' | 'error' | 'success'
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (notification_type);

-- 4. Atomic Version Switch Stored Function
CREATE OR REPLACE FUNCTION publish_portfolio_version(
    p_version_number INT,
    p_checksum VARCHAR(64),
    p_content_json JSONB,
    p_audit_hash VARCHAR(64),
    p_workflow_id VARCHAR(100),
    p_changelog TEXT,
    p_published_by VARCHAR(50),
    p_trigger_type VARCHAR(50),
    p_seo_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS BOOLEAN AS $$
DECLARE
    v_prev_version INT;
BEGIN
    -- Get current active version
    SELECT version_number INTO v_prev_version FROM portfolio_versions WHERE is_active = TRUE LIMIT 1;

    -- Deactivate current active version
    UPDATE portfolio_versions SET is_active = FALSE WHERE is_active = TRUE;

    -- Insert new active version
    INSERT INTO portfolio_versions (
        version_number,
        checksum,
        is_active,
        content_json,
        audit_hash,
        created_by_workflow,
        changelog_summary,
        published_by,
        trigger_type,
        seo_metadata,
        published_at,
        created_at
    ) VALUES (
        p_version_number,
        p_checksum,
        TRUE,
        p_content_json,
        p_audit_hash,
        p_workflow_id,
        p_changelog,
        p_published_by,
        p_trigger_type,
        p_seo_metadata,
        NOW(),
        NOW()
    );

    -- Record in publish_logs
    INSERT INTO publish_logs (
        candidate_checksum,
        target_version_number,
        policy_check_passed,
        policy_summary,
        transaction_status,
        previous_version_number
    ) VALUES (
        p_checksum,
        p_version_number,
        TRUE,
        jsonb_build_object('published_by', p_published_by, 'trigger_type', p_trigger_type),
        'success',
        v_prev_version
    );

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Atomic publishing transaction failed: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

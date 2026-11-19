-- ====================================================================
-- YASHUVERSE DATABASE SCHEMA: MIGRATION 003_PGVECTOR_AND_ENTITY_EMBEDDINGS.SQL
-- Phase 3: Custom ML Intelligence Engine
-- Enables pgvector extension, entity semantic embeddings, duplicate matching,
-- and cosine similarity search functions.
-- ====================================================================

-- 1. Enable pgvector extension (Supabase / PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Add Vector Embeddings to Entities & Knowledge Facts
-- 384-dimensional dense vectors (matching all-MiniLM-L6-v2 embeddings)
ALTER TABLE entities 
    ADD COLUMN IF NOT EXISTS embedding vector(384),
    ADD COLUMN IF NOT EXISTS repo_url TEXT,
    ADD COLUMN IF NOT EXISTS duplicate_candidate_ids UUID[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS embedding_model_version VARCHAR(50);

ALTER TABLE knowledge_facts 
    ADD COLUMN IF NOT EXISTS embedding vector(384),
    ADD COLUMN IF NOT EXISTS embedding_model_version VARCHAR(50);

-- 3. HNSW High-Speed Index for Cosine Similarity Searches
CREATE INDEX IF NOT EXISTS idx_entities_embedding_hnsw 
    ON entities USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_entities_repo_url 
    ON entities (repo_url);

-- 4. Cosine Distance Matching Function for Duplicate Entity Resolution
CREATE OR REPLACE FUNCTION match_entities(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.88,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    entity_id VARCHAR(100),
    entity_type VARCHAR(50),
    canonical_name VARCHAR(255),
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.entity_id,
        e.entity_type,
        e.canonical_name,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM entities e
    WHERE e.embedding IS NOT NULL
      AND 1 - (e.embedding <=> query_embedding) >= match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

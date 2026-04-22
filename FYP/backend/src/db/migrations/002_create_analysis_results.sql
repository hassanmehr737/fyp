-- Migration 002: Analysis results table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS analysis_results (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(128)    REFERENCES users(id) ON DELETE CASCADE,
    email_content   TEXT            NOT NULL,
    subject         VARCHAR(500),
    sender          VARCHAR(255),
    provider        VARCHAR(50)     NOT NULL,
    classification  VARCHAR(50)     NOT NULL,
    confidence      NUMERIC(5,4)    NOT NULL,
    explanation     TEXT,
    indicators      JSONB           DEFAULT '[]',
    response_time_ms INTEGER,
    token_usage     JSONB,
    prompt_strategy VARCHAR(50)     DEFAULT 'zero-shot',
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_results(created_at DESC);

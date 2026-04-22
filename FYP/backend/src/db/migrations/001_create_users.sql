-- Migration 001: Users table
-- User ID = Firebase UID (string, max 128 chars)
CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(128)    PRIMARY KEY,
    email           VARCHAR(255)    UNIQUE NOT NULL,
    name            VARCHAR(255)    NOT NULL DEFAULT 'User',
    technical_background VARCHAR(50) DEFAULT 'none',
    age_group       VARCHAR(20),
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     DEFAULT NOW()
);

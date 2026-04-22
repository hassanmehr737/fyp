-- Migration 004: Evaluation (pre/post test) sessions
CREATE TABLE IF NOT EXISTS test_sessions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(128)    REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20)     NOT NULL CHECK (type IN ('pre-test', 'post-test')),
    score           NUMERIC(5,2),
    total_questions INTEGER         DEFAULT 0,
    correct_answers INTEGER         DEFAULT 0,
    answers         JSONB           DEFAULT '[]',
    started_at      TIMESTAMPTZ     DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_test_sessions_user ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_type ON test_sessions(user_id, type);

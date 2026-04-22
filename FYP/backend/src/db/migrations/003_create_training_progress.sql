-- Migration 003: Training progress per user per module
CREATE TABLE IF NOT EXISTS training_progress (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             VARCHAR(128)    REFERENCES users(id) ON DELETE CASCADE,
    module_id           VARCHAR(128)    NOT NULL,
    completed_emails    INTEGER         DEFAULT 0,
    total_emails        INTEGER         DEFAULT 0,
    correct_answers     INTEGER         DEFAULT 0,
    current_streak      INTEGER         DEFAULT 0,
    best_streak         INTEGER         DEFAULT 0,
    badges              JSONB           DEFAULT '[]',
    started_at          TIMESTAMPTZ     DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    UNIQUE(user_id, module_id)
);

-- Individual answer records for detailed analysis
CREATE TABLE IF NOT EXISTS training_answers (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(128)    REFERENCES users(id) ON DELETE CASCADE,
    module_id       VARCHAR(128)    NOT NULL,
    email_id        VARCHAR(128)    NOT NULL,
    user_answer     VARCHAR(50)     NOT NULL,
    is_correct      BOOLEAN         NOT NULL,
    time_spent_ms   INTEGER,
    answered_at     TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_answers_user ON training_answers(user_id);

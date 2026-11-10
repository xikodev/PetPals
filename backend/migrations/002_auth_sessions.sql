-- Apply separately after 001_initial_schema.sql. No automatic startup migrations.
BEGIN;

CREATE TABLE auth_sessions (
    token_hash TEXT PRIMARY KEY,
    purpose TEXT NOT NULL CHECK (purpose IN ('oauth', 'registration', 'authenticated')),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    absolute_expires_at TIMESTAMPTZ NOT NULL,
    CHECK (expires_at <= absolute_expires_at),
    CHECK ((purpose = 'authenticated') = (user_id IS NOT NULL))
);

CREATE INDEX auth_sessions_expiry_idx ON auth_sessions (expires_at);
CREATE INDEX auth_sessions_user_idx ON auth_sessions (user_id);

COMMIT;

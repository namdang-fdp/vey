-- Bind application sessions to their issuing identity session, without cross-schema FKs.
ALTER TABLE iam.sessions ADD COLUMN auth_session_id VARCHAR(255);
ALTER TABLE iam.sessions ADD COLUMN auth_session_created_at TIMESTAMPTZ;

-- Legacy sessions have no verifiable binding and must authenticate again.
UPDATE iam.sessions SET status = 'REVOKED', revoked_at = now(),
    revoked_reason = 'IDENTITY_BINDING_MIGRATION', updated_at = now()
WHERE status = 'ACTIVE';

ALTER TABLE iam.sessions ADD CONSTRAINT ck_sessions_active_identity
    CHECK (status <> 'ACTIVE' OR (auth_session_id IS NOT NULL AND auth_session_created_at IS NOT NULL));

CREATE INDEX idx_sessions_identity ON iam.sessions(auth_session_id);

-- This ledger also covers identities that have never provisioned an IAM user.
-- A NULL auth_session_id revokes all identity sessions created on/before occurred_at.
CREATE TABLE iam.auth_revocations (
    id UUID PRIMARY KEY,
    auth_user_id VARCHAR(255) NOT NULL,
    auth_session_id VARCHAR(255),
    occurred_at TIMESTAMPTZ NOT NULL,
    reason VARCHAR(32) NOT NULL CONSTRAINT ck_auth_revocations_reason
        CHECK (reason IN ('SESSION_REVOKED', 'PASSWORD_RESET')),
    CONSTRAINT ck_auth_revocations_scope CHECK (
        (reason = 'SESSION_REVOKED' AND auth_session_id IS NOT NULL) OR
        (reason = 'PASSWORD_RESET' AND auth_session_id IS NULL))
);

CREATE INDEX idx_auth_revocations_identity ON iam.auth_revocations(auth_user_id, auth_session_id);

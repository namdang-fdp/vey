CREATE SCHEMA iam;

CREATE TABLE iam.users (
    id UUID PRIMARY KEY,
    auth_user_id VARCHAR(255) NOT NULL CONSTRAINT uq_users_auth_user_id UNIQUE,
    primary_email VARCHAR(320) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url TEXT,
    locale VARCHAR(64),
    timezone VARCHAR(64),
    status VARCHAR(16) NOT NULL CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'DISABLED')),
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE iam.workspaces (
    id UUID PRIMARY KEY,
    type VARCHAR(16) NOT NULL CONSTRAINT ck_workspaces_type CHECK (type IN ('PERSONAL', 'TEAM')),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL CONSTRAINT uq_workspaces_slug UNIQUE,
    created_by_user_id UUID NOT NULL CONSTRAINT fk_workspaces_creator REFERENCES iam.users(id) ON DELETE RESTRICT,
    -- Only the initial provisioned workspace is unique; other PERSONAL workspaces are allowed.
    initial_for_user_id UUID CONSTRAINT fk_workspaces_initial_user REFERENCES iam.users(id)
        CONSTRAINT uq_workspaces_initial_user UNIQUE,
    CONSTRAINT ck_workspaces_initial CHECK (initial_for_user_id IS NULL OR
        (type = 'PERSONAL' AND initial_for_user_id = created_by_user_id)),
    status VARCHAR(16) NOT NULL CONSTRAINT ck_workspaces_status CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_workspaces_creator ON iam.workspaces(created_by_user_id);

CREATE TABLE iam.workspace_memberships (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL CONSTRAINT fk_memberships_workspace REFERENCES iam.workspaces(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL CONSTRAINT fk_memberships_user REFERENCES iam.users(id) ON DELETE RESTRICT,
    -- Membership classifications only; these values do not implement RBAC.
    role VARCHAR(16) NOT NULL CONSTRAINT ck_memberships_role CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'GUEST')),
    status VARCHAR(16) NOT NULL CONSTRAINT ck_memberships_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'LEFT', 'REMOVED')),
    joined_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_memberships_workspace_user UNIQUE (workspace_id, user_id)
);

-- The unique index above already supports workspace lookups.
CREATE INDEX idx_memberships_user ON iam.workspace_memberships(user_id);

CREATE TABLE iam.sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL CONSTRAINT fk_sessions_user REFERENCES iam.users(id) ON DELETE RESTRICT,
    -- Fingerprint of the consumed exchange JWT, never the JWT itself. Prevents replay.
    exchange_token_hash VARCHAR(64) CONSTRAINT uq_sessions_exchange_token UNIQUE,
    token_hash VARCHAR(64) NOT NULL CONSTRAINT uq_sessions_token_hash UNIQUE,
    active_workspace_id UUID CONSTRAINT fk_sessions_workspace REFERENCES iam.workspaces(id) ON DELETE RESTRICT,
    status VARCHAR(16) NOT NULL CONSTRAINT ck_sessions_status CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    CONSTRAINT ck_sessions_token_hash CHECK (token_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX idx_sessions_user ON iam.sessions(user_id);
CREATE INDEX idx_sessions_active_workspace ON iam.sessions(active_workspace_id);
CREATE INDEX idx_sessions_active_expiration ON iam.sessions(expires_at) WHERE status = 'ACTIVE';

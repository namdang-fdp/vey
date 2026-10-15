-- Local profile only. Fixed synthetic identities; never use real identity accounts or raw tokens.
INSERT INTO iam.users (id, auth_user_id, primary_email, email_verified, first_name, last_name,
                       display_name, locale, timezone, status, created_at)
VALUES ('01950000-0000-7000-8000-000000000001', 'user_vey_local_owner', 'owner@vey.example', FALSE,
        'Alex', 'Nguyen', 'Alex Nguyen', 'en', 'Asia/Ho_Chi_Minh', 'ACTIVE', '2026-01-01T00:00:00Z'),
       ('01950000-0000-7000-8000-000000000002', 'user_vey_local_member', 'member@vey.example', FALSE,
        'Sam', 'Tran', 'Sam Tran', 'en', 'Asia/Ho_Chi_Minh', 'ACTIVE', '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO iam.workspaces (id, type, name, slug, created_by_user_id, status, created_at)
VALUES ('01950000-0000-7000-8000-000000000011', 'PERSONAL', 'Alex Personal', 'vey-local-personal',
        '01950000-0000-7000-8000-000000000001', 'ACTIVE', '2026-01-01T00:00:00Z'),
       ('01950000-0000-7000-8000-000000000012', 'TEAM', 'Vey Local Team', 'vey-local-team',
        '01950000-0000-7000-8000-000000000001', 'ACTIVE', '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO iam.workspace_memberships (id, workspace_id, user_id, role, status, joined_at, created_at)
VALUES ('01950000-0000-7000-8000-000000000021', '01950000-0000-7000-8000-000000000011',
        '01950000-0000-7000-8000-000000000001', 'OWNER', 'ACTIVE', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
       ('01950000-0000-7000-8000-000000000022', '01950000-0000-7000-8000-000000000012',
        '01950000-0000-7000-8000-000000000001', 'OWNER', 'ACTIVE', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
       ('01950000-0000-7000-8000-000000000023', '01950000-0000-7000-8000-000000000012',
        '01950000-0000-7000-8000-000000000002', 'MEMBER', 'ACTIVE', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO iam.sessions (id, user_id, token_hash, active_workspace_id, status,
                          expires_at, revoked_at, revoked_reason, created_at)
VALUES ('01950000-0000-7000-8000-000000000031', '01950000-0000-7000-8000-000000000001',
        '0000000000000000000000000000000000000000000000000000000000000000',
        '01950000-0000-7000-8000-000000000011', 'REVOKED', '2026-01-02T00:00:00Z',
        '2026-01-01T01:00:00Z', 'LOCAL_SEED', '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

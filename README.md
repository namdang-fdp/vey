# Vey

## Requirements

Java 25, Docker with Compose, and Bun 1.4.x.

## Start infrastructure

```sh
docker compose up -d
```

The default local ports are PostgreSQL 55432, Redis 56379, Kafka 59092, and MinIO 59000/59001. See `.env.example` to override them. These credentials are for local development only.

## Start backend

```sh
cd api
./mvnw spring-boot:run
```

## Start frontend

```sh
cd frontend
bun install --frozen-lockfile
bun run dev
```

`NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:8081`; see `frontend/.env.example`.

Authentication uses Better Auth for identity and Vey-owned sessions for protected API access.

## Quality

```sh
cd api
./mvnw spotless:check checkstyle:check verify
cd ../frontend
bun run lint
bun run typecheck
bun run test
bun run build
```

Backend integration tests use Testcontainers and need Docker. `make setup` installs root pre-commit hooks when `pre-commit` is available.

For the local browser smoke test, start the API and run `bunx playwright install chromium` followed by `bun run test:e2e` in `frontend/`.

## CI and container publishing

`.github/workflows/ci.yml` runs backend formatting, Checkstyle, tests and packaging,
plus frontend formatting, lint, typecheck, unit tests and production build on PRs,
pushes to `main` and `feature/deployment`, and manual runs. After both apps pass,
a matrix builds both Dockerfiles. PRs and manual runs on other branches only build;
pushes/manual runs on `main` or `feature/deployment` publish each image to both
GHCR and Docker Hub.

| App      | GHCR                               | Docker Hub                 |
| -------- | ---------------------------------- | -------------------------- |
| Backend  | `ghcr.io/namdang-fdp/vey-api`      | `<namespace>/vey-api`      |
| Frontend | `ghcr.io/namdang-fdp/vey-frontend` | `<namespace>/vey-frontend` |

Production versions are `0.1`, `0.2`, `0.3`, etc., reserved as lightweight Git tags
`v0.N` after quality gates pass. Rerunning the same commit reuses its version;
a failed publication keeps its reserved version. Development builds use
`dev-<CI run number>`. Each registry also receives a branch tag (`main` or
`feature-deployment`); only `main` updates `latest`. Deploy using a numbered
version, and roll back by selecting the previous verified version for both apps.
Registry publishing is not atomic: if either upload fails, fix/re-run that job and
verify both images before deploying. After both images publish on `main`,
`.github/workflows/cd.yaml` connects over SSH and runs the server's `cd.sh`.
See [deployment/README.md](deployment/README.md) for server layout, SSH secrets,
version tracking, bootstrap and rollback.

Repository Actions secrets:

- `DOCKERHUB_USERNAME`: Docker Hub login username.
- `DOCKERHUB_TOKEN`: access token with push permission for both repositories.
- GHCR uses the automatically provided `GITHUB_TOKEN` with job-level
  `packages: write`; no separate GHCR secret is needed.

The Docker Hub namespace defaults to the login username. Set repository variable
`DOCKERHUB_NAMESPACE` for an organization namespace with appropriate token access.
Publishing fails if either Docker Hub secret is missing or registry login fails.

Set repository variable `NEXT_PUBLIC_API_BASE_URL` to the public API origin;
the image build defaults to `https://vey.dorriss.com`. This value is compiled into
the frontend and changing it requires rebuilding. Keep the public API and frontend
on the same hostname, routing `/api/v1` to Spring and `/api/auth` to Next.js.

The frontend uses Next.js standalone output, installs dependencies with Bun 1.4.0
and runs as the unprivileged `node` user on Node.js 24. Both images target
`linux/amd64`, matching the current VPS. Build locally:

```sh
docker build -t vey-api:local api
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://vey.dorriss.com -t vey-frontend:local frontend
```

Provide `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_DATABASE_URL`,
`VEY_API_INTERNAL_URL`, and email/OAuth settings from `frontend/.env.example` at
container runtime. Production auth credentials are never needed for image builds;
the build uses an ephemeral secret and an unused database URL. Bootstrap the auth
database using the identity instructions below before using auth endpoints. Supply
Spring runtime settings from `.env.example`, with container-reachable infrastructure
and JWKS addresses, HTTPS issuer/audience, and secure cookies enabled.

References: [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
and [Docker multi-registry publishing](https://docs.docker.com/build/ci/github-actions/push-multi-registries/).

## URLs

- Frontend: http://localhost:3000
- Vey API health: http://localhost:8081/api/v1/health
- Swagger UI: http://localhost:8081/swagger-ui/index.html
- Actuator health: http://localhost:8081/actuator/health
- MinIO console: http://localhost:59001

## Identity bridge and application sessions (BA4)

Better Auth authenticates users in Next.js. Successful password, social and email
verification flows converge on `/auth/complete`. The browser obtains an ES256 JWT
from `/api/auth/token`, exchanges it once at `POST /api/v1/auth/session`, checks
`GET /api/v1/auth/me`, then opens Meetings. JWTs remain transient in memory; normal
business requests use the HttpOnly `vey_session` cookie directly against Spring.

The identity JWT contract is `token_use=identity`, UUID `jti`, `sid`,
`auth_session_created_at` (epoch milliseconds), `sub`, `email`, `name`,
`emailVerified`, `image`, `iss`, `aud`, `iat`, `exp`. `sub` is the external user ID;
`sid` is the issuing Better Auth session ID. Issuer/audience default to the Better
Auth origin; lifetime is 15 minutes. Configure Spring with `VEY_AUTH_ISSUER`,
`VEY_AUTH_JWKS_URI`, and `VEY_AUTH_AUDIENCE`. Production uses
`https://vey.dorriss.com` and `https://vey.dorriss.com/api/auth/jwks`.
Spring's Nimbus decoder verifies ES256, signature, key ID, issuer, audience,
timestamps and identity claim types. Identity JWTs are accepted only at exchange.

IAM owns `users`, `workspaces`, `workspace_memberships`, `sessions` and the
`auth_revocations` ledger under `iam`.
Better Auth owns `auth`; Spring never queries it or references it with foreign keys.
A unique `auth_user_id` plus a transaction-scoped identity advisory lock serializes
provisioning and revocation, including before an IAM user exists. The logical link
is `iam.users.auth_user_id = auth.user.id`; `auth.account.userId` references that
identity for each credential/social login method. There is no direct account/IAM FK.
`workspaces.initial_for_user_id` marks the initial workspace without forbidding
additional PERSONAL workspaces. Existing suspended memberships are not reactivated
by login. Only email, verification status, display name, avatar and last-seen time
are synchronized; locale/timezone remain Vey-owned.

Sessions use 32 random bytes, base64url encoded; PostgreSQL stores SHA-256 hashes.
A unique hash of `issuer|jti` prevents passport replay, including alternate JWS
signature encodings. Each Vey session records its issuing identity session and creation
time. Session TTL is configured once
via `VEY_AUTH_SESSION_TTL` (default 7 days) for both expiry and cookie Max-Age.
Cookies are host-only, HttpOnly, Path=/, SameSite=Lax; set
`VEY_AUTH_COOKIE_SECURE=true` on HTTPS deployments. The frontend and public API
must share a hostname so the server-rendered shell receives this host-only cookie
(ports may differ locally). Use a reverse proxy for `/api/v1` in production;
`VEY_API_INTERNAL_URL` optionally supplies the server-to-server Spring address.
Logout first revokes all Vey sessions bound to that identity session and tombstones
its `sid`, then signs out of Better Auth. Errors retain a retry path. The Next.js
handler verifies identity deletion before forwarding a successful logout response.
Unknown/revoked cookies can log out.
A missing/invalid session returns 401; a valid session without active membership
returns 403. Redis caching and full RBAC are not implemented.

Method security is enabled. Each authenticated Vey request receives exactly one
authority, `ROLE_<membershipRole>`, from its active workspace membership, reloaded
from PostgreSQL on each request. Spring-managed methods can use
`@PreAuthorize("hasRole('OWNER')")` or `hasAnyRole(...)`; roles have no implicit
hierarchy. Resource access must also enforce the active workspace boundary.

The shell checks Vey session validity first. A valid Vey session remains usable
when the identity session naturally expires. A missing/expired Vey session with
a valid identity goes through `/auth/complete`; without either session it goes to
login. Business API 401s trigger the same recovery once; 403s and server outages
are not treated as expiry.

Better Auth session deletion and password reset notify
`POST /api/v1/auth/identity/revoke` using a server-only ES256 JWT with
`token_use=revocation`, UUID `jti`, `sub`, `reason`, `occurred_at`, optional `sid`,
and a 60-second lifetime. Identity and revocation purposes cannot be interchanged.
Password reset records an identity-wide cutoff before consuming the reset token;
device deletion also records each revoked `sid`. The complete Better Auth HTTP
reset handler runs inside an auth database transaction, so a later failed
notification rolls back password/token/session writes and permits retry. Already
accepted IAM revocations remain fail-closed. Request bodies are buffered with an
8 KiB / 5-second bound before opening the transaction. Natural expiry cleanup
does not emit logout revocations.

Local Swagger: `http://localhost:8081/swagger-ui/index.html` with
`VEY_API_DOCS_ENABLED=true`; anonymous docs access defaults to disabled.

Validation: run `./mvnw -B -ntp spotless:check checkstyle:check verify` in `api`,
then `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run test`,
`bun run build`, and `bun run test:e2e` in `frontend`. `bun run test:auth` adds a real
PostgreSQL/Next.js/Spring/browser lifecycle regression with two devices and an
injected mid-reset outage. It requires a built backend jar, running local Redis/Kafka,
database CREATE/DROP permission and free ports 3100/8082/8083. It creates/drops only
its randomly named `vey_auth_test_*` database. Rebuild with normal environment
afterward because the test build uses its isolated API URL.

Cookie-authenticated state-changing API requests require an `Origin` header that
matches the configured frontend origin; missing or mismatched origins receive 403.
The JWT exchange endpoint remains bearer-authenticated. CORS allows only the
configured frontend origin with credentials.

Fresh local bootstrap: start PostgreSQL with `docker compose up -d postgres`,
start Spring with datasource credentials matching the compose overrides (the
Spring default port is 55432), then run the official Better Auth CLI in `frontend`:

```sh
bunx auth@latest generate --config ./src/lib/auth/server.ts --output ./better-auth-schema.sql --yes
# Inspect: CREATE SCHEMA auth and every table qualified as "auth"."...".
bunx auth@latest migrate --config ./src/lib/auth/server.ts --yes
```

The current CLI requires temporarily removing `import "server-only"` from the auth
config, its email helper and its revocation helper while running these commands;
restore all three guards immediately afterward, before starting Next.js.
Never put Better Auth SQL in Flyway.
Hibernate runs with `ddl-auto=validate`.

IAM sample data is opt-in with `SPRING_PROFILES_ACTIVE=local`, using `db/seed`.
Use a separate disposable database for that profile: its repeatable migration and
synthetic rows remain after the profile is turned off. The sample session is revoked.

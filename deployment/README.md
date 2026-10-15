# Vey server deployment

Production CD runs only from `main`, after quality checks and both registry
uploads pass. Superseded main commits do not automatically deploy; intentional
rollbacks use the manual CD workflow. Production image versions are `0.1`, `0.2`, etc. The CI version job
reserves `v0.N` in Git; a retry of the same commit keeps that version. A failed
publication may leave a reserved version, which is never assigned to another
commit. Neither the operator nor the server needs to select a commit SHA.

The server tracks the active release in `VERSION` in both application `.env`
files. `0.0` means bootstrapped infrastructure with no application release yet.
Branch images use `dev-<CI run number>` and never trigger production CD.

## Layout

```text
/root/selfhost/
  databases/postgres18/{compose.yaml,.env,data/}
  core/kafka/{compose.yaml,.env,data/}
  vey/
    cd.sh
    vey-frontend/{compose.yaml,.env}
    vey-backend/{compose.yaml,.env}
```

All services use the existing external `selfhost_net`; none publishes host ports.
PG18 is independent of shared PG16, with the same existing login credentials and
new database `vey`. MinIO retains the existing credentials and new bucket
`vey-media`. Kafka is a single KRaft broker with internal advertised address
`kafka:9092`, persistence, a healthcheck, a 512 MiB heap and a 1 GiB container limit.
This provides persistence but no broker redundancy.

Copy the four compose templates to the paths above. Real `.env` files stay on the
server with mode `0600`; their contents must never enter Git or workflow logs.
PG18 needs `POSTGRES_USER` and `POSTGRES_PASSWORD`; Kafka needs a stable
`KAFKA_CLUSTER_ID`. Run PG18 and Kafka first and wait for healthy status. Apply
`frontend/better-auth-schema.sql` once to the new `vey` database before starting
the frontend. Backend Flyway creates/migrates `iam` when the backend starts.

Application runtime values:

| Value                               | Setting                                               |
| ----------------------------------- | ----------------------------------------------------- |
| Frontend `BETTER_AUTH_URL`          | `https://vey.dorriss.com`                             |
| Frontend `NEXT_PUBLIC_API_BASE_URL` | `https://vey.dorriss.com` (also the CI build default) |
| Frontend `VEY_API_INTERNAL_URL`     | `http://vey-backend:8081`                             |
| Frontend database host/database     | `postgres18:5432/vey`                                 |
| Backend datasource                  | `jdbc:postgresql://postgres18:5432/vey`               |
| Backend Redis                       | `redis:6379`, with the existing Redis password        |
| Backend Kafka                       | `kafka:9092`                                          |
| Backend storage                     | `http://minio:9000`, bucket `vey-media`               |
| Backend issuer/audience/CORS origin | `https://vey.dorriss.com`                             |
| Backend JWKS URI                    | `http://vey-frontend:3000/api/auth/jwks`              |
| Backend secure cookie               | `VEY_AUTH_COOKIE_SECURE=true`                         |

Resend, templates, OAuth and Better Auth secret come from the supplied local
frontend configuration. Localhost URLs must be replaced with the production
values above; database URL passwords must be URL-encoded. The frontend API base
URL is compiled into its image, so changing the server env alone cannot change it.

## Routing

Cloudflared forwards both Vey hostnames to `http://core_nginx:80`. Configure these
two tunnel routes separately in Cloudflare; this deployment does not manage them.

Nginx routes `vey.dorriss.com/api/v1` and descendants to `vey-backend:8081`, with
all other paths on that host routed to `vey-frontend:3000`, including `/api/auth`.
`vey-api.dorriss.com` routes to `vey-backend:8081` directly.

The browser uses the frontend hostname's API proxy because the Vey session cookie
is host-only. The public backend hostname remains available, but browser calls
made directly to it do not share the frontend hostname's cookie. Internal calls
use Docker DNS and do not traverse Cloudflare.

## GitHub Actions SSH secrets

Set these repository Actions secrets before merging the CD change into `main`:

| Secret            | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| `SSH_HOST`        | `157.66.100.18`                                         |
| `SSH_PORT`        | `22`                                                    |
| `SSH_USER`        | `root` (current server layout is under `/root`)         |
| `SSH_PRIVATE_KEY` | A dedicated, unencrypted Ed25519 deployment private key |
| `SSH_KNOWN_HOSTS` | Verified OpenSSH known-hosts entry for this server      |

Generate a new deployment key on the local machine, register its public key on
the server, and upload the private key directly from disk instead of chat:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/vey-github-actions -C vey-github-actions -N ''
```

Append its public key to the server's `/root/.ssh/authorized_keys`, prefixed with
`restrict ` to disable forwarding and PTY access. Keep the existing keys intact.
Then set `SSH_PRIVATE_KEY` using:

```sh
{ printf 'restrict '; cat ~/.ssh/vey-github-actions.pub; } | ssh dorriss-server 'umask 077; cat >> /root/.ssh/authorized_keys'
gh secret set SSH_PRIVATE_KEY --repo namdang-fdp/vey < ~/.ssh/vey-github-actions
```

For `SSH_KNOWN_HOSTS`, obtain the entry from the already verified local
`~/.ssh/known_hosts` using `ssh-keygen -F 157.66.100.18`; omit the comment line.
Verify any new host key against the server console before accepting it.
The workflow enforces host-key verification and fails if secrets are missing.
The server already has registry login configuration; ensure it retains pull
permission for both GHCR images.

## Deployment and rollback

Install `deployment/cd.sh` at `/root/selfhost/vey/cd.sh`, mode `0700`.
The workflow runs `bash /root/selfhost/vey/cd.sh 0.N` over SSH. The script locks
deployment, checks the two env versions agree, pulls both target images, updates
only `VERSION`, and waits for backend/frontend health. A failed update restores
both previous env files and starts the previous images. A failed first deployment
stops the application containers and restores `0.0`. A failed pull never changes
the active version.

For an intentional rollback, run the **CD** workflow manually on `main` with the
previous numbered version, or run the same server command over SSH. Container
rollback does not undo database migrations; future migrations must remain
compatible with the previous release. Verify public login and email flows after
Cloudflare routes are configured. Keep API docs and JobRunr dashboard disabled
unless explicitly required.

Compose files and `cd.sh` are installed during server setup. CI updates application
images automatically; changes to these server configuration files must also be
installed before deploying a release that requires them.

## Verification

```sh
python3 -m unittest discover -s deployment/tests
bash -n deployment/cd.sh
docker run --rm -v "$PWD:/mnt" koalaman/shellcheck:v0.10.0 deployment/cd.sh
```

Validate compose files with `docker compose config --quiet` using each service's
env. Deployment regressions cover version allocation/retry, successful env
updates, failed pulls, failed updates, first-deploy failure and inconsistent
versions without connecting to production Docker.

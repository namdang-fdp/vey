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

Authentication is intentionally absent in this foundation; Clerk integration belongs to VEY-14.

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

## URLs

- Frontend: http://localhost:3000
- Vey API health: http://localhost:8081/api/v1/health
- Swagger UI: http://localhost:8081/swagger-ui/index.html
- Actuator health: http://localhost:8081/actuator/health
- MinIO console: http://localhost:59001

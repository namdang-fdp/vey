# Vey frontend organization

- Keep changes inside `frontend/` unless the task explicitly authorizes another area. Preserve existing work and keep changes unstaged unless a commit is requested.
- Use kebab-case files/directories, PascalCase component names and `useSomething` hook names. Keep framework-reserved filenames unchanged.
- `src/app` owns routes, metadata, server access checks and page composition. Group public pages under `(public)`, auth pages under `(auth)` and protected pages under `(application)`; route groups must preserve public URLs.
- `src/features/<feature>` owns product components, API operations, schemas, hooks and utilities. Add subfolders only when they contain actual code; do not scaffold future features.
- `src/features/auth/api/session.server.ts` reads the Vey application session for server guards. Keep its response contract in `features/auth/schemas`; identity integration with Better Auth belongs in `src/lib/auth`.
- `src/components/layout` owns reusable shells/navigation, `components/feedback` owns shared presentation feedback, `components/icons` owns icons (with animated icons under `icons/animated`) and `components/ui` owns domain-neutral controls.
- Shared components must not import feature internals. Pass authenticated data and feature actions through props or React slots; keep request/session checks in server route boundaries.
- Keep feature-only motion with that feature. Introduce a shared motion folder only when the code is actually shared; name folders by responsibility rather than the source library.
- `src/lib` owns platform infrastructure and shared API transport, `src/config` owns environment/routes/navigation rules and `src/providers` composes application contexts.
- Browser business requests reuse the shared API client. Preserve the explicit server-only session request and identity integration boundaries; do not add alternate transports or one-line service/hook wrappers.
- Keep Server Components as the default. Preserve the identity/application session distinction and backend authorization; do not replace server guards with client-only gates during organization changes.
- Tests live under `tests/unit/`, mirroring source folders. Browser smoke/UI tests belong in `tests/e2e/`; the isolated real auth lifecycle suite belongs in `tests/auth-e2e/`. Do not colocate tests in production source.
- Keep assets under `public/` or `src/assets` as appropriate, and retain upstream attribution when moving third-party code.
- Avoid empty route groups, unused layouts, global hooks/services/types buckets and broad barrel exports. Extract modules for meaningful behavior, reuse or responsibility.
- Run affected unit tests while refactoring, then `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run test` and `bun run build`. Run relevant Playwright checks for route, shell or auth changes; `bun run test:auth` owns a disposable database and requires the local backend/database setup.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

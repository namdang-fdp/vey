# Vey repository contract

- Read [Vey Brain](vey-brain/AGENTS.md) and relevant product/architecture docs before changing product or architecture. Jira owns execution; Brain records why, decisions, and research; GitHub/code is implementation truth.
- Backend package root: `com.dorriss.vey`. Architecture: disciplined event-driven modular monolith. Keep `common`, `infrastructure`, and real business modules separate. Infrastructure and common must not depend on modules. Within a module, direct calls are allowed. Cross-module business communication uses Kafka event contracts. JobRunr handles durable background jobs.
- Frontend: Bun 1.4.x, Next.js 16, React 19, TypeScript, Tailwind CSS v4 and shadcn/ui. Reuse the shared API transport. Avoid premature abstraction and fabricated product data.
- Run the affected formatting, lint, typecheck, test, and build gates. Keep changes unstaged. Do not commit or push unless explicitly requested.
